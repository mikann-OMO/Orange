import { createHash } from "node:crypto";
import type { CreateMessageDto, DeviceInfo } from "@/types/message";
import { addMessage, buildMessageTree, getMessages } from "@/utils/local-db";
import type { APIRoute } from "astro";
import sanitizeHtml from "sanitize-html";
import { UAParser } from "ua-parser-js";

export const prerender = false;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const rateLimitBucket = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request): string {
	const xff = request.headers.get("x-forwarded-for");
	if (xff) return xff.split(",")[0]?.trim() || "unknown";
	return (
		request.headers.get("cf-connecting-ip") ||
		request.headers.get("x-real-ip") ||
		"unknown"
	);
}

function rateLimitOrThrow(request: Request, slug: string): void {
	const ip = getClientIp(request);
	const key = `${ip}:${slug}`;
	const now = Date.now();
	const current = rateLimitBucket.get(key);
	if (!current || now >= current.resetAt) {
		rateLimitBucket.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
		return;
	}
	if (current.count >= RATE_LIMIT_MAX) {
		throw new Error("RATE_LIMITED");
	}
	current.count += 1;
	rateLimitBucket.set(key, current);
}

function normalizeTrimmedString(input: unknown): string {
	return typeof input === "string" ? input.trim() : "";
}

function isValidEmail(input: string): boolean {
	// Intentionally simple; avoids heavy deps and rejects obvious bad inputs.
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

function sanitizeMessageContent(input: string): string {
	const textOnly = sanitizeHtml(input, {
		allowedTags: [],
		allowedAttributes: {},
	});
	return textOnly.replace(/\r\n|\r|\n/g, "<br/>");
}

function md5Hex(input: string): string {
	return createHash("md5").update(input).digest("hex");
}

export const GET: APIRoute = async ({ request }) => {
	try {
		const url = new URL(request.url);
		const slug = url.searchParams.get("slug") || undefined;
		const messages = await getMessages(slug);
		const tree = buildMessageTree(messages);
		return new Response(JSON.stringify(tree), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error getting messages:", error);
		return new Response(JSON.stringify({ error: "Failed to get messages" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};

export const POST: APIRoute = async ({ request }) => {
	try {
		const body = (await request.json()) as CreateMessageDto;

		const slug = normalizeTrimmedString(body.slug);
		const nickname = normalizeTrimmedString(body.nickname);
		const email = normalizeTrimmedString(body.email).toLowerCase();
		const website = normalizeTrimmedString(body.website);
		const contentRaw = normalizeTrimmedString(body.content);
		const parentId = normalizeTrimmedString(body.parentId) || null;

		if (!slug || !contentRaw || !nickname || !email) {
			return new Response(
				JSON.stringify({ error: "Missing required fields" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		if (
			slug.length > 200 ||
			nickname.length > 30 ||
			email.length > 254 ||
			(website && website.length > 200) ||
			contentRaw.length > 2000
		) {
			return new Response(JSON.stringify({ error: "Invalid fields" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		if (!isValidEmail(email)) {
			return new Response(JSON.stringify({ error: "Invalid email" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		try {
			rateLimitOrThrow(request, slug);
		} catch (e) {
			if (e instanceof Error && e.message === "RATE_LIMITED") {
				return new Response(
					JSON.stringify({ error: "Too many requests, please try later." }),
					{
						status: 429,
						headers: { "Content-Type": "application/json" },
					},
				);
			}
			throw e;
		}

		const uaString = request.headers.get("user-agent") || "";
		const parser = new UAParser(uaString);
		const browser = parser.getBrowser();
		const os = parser.getOS();
		const device = parser.getDevice();

		const deviceInfo: DeviceInfo = {
			browser: browser.name
				? `${browser.name} ${browser.version || ""}`.trim()
				: null,
			os: os.name ? `${os.name} ${os.version || ""}`.trim() : null,
			device: device.model || null,
		};

		const avatar = `https://www.gravatar.com/avatar/${md5Hex(email)}?d=identicon&s=64`;
		const content = sanitizeMessageContent(contentRaw);

		const message = await addMessage(
			{
				slug,
				content,
				nickname,
				website: website || null,
				avatar,
				parentId,
			},
			deviceInfo,
		);

		return new Response(JSON.stringify(message), {
			status: 201,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error adding message:", error);
		return new Response(JSON.stringify({ error: "Failed to add message" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};
