import type { APIRoute } from "astro";
import { UAParser } from "ua-parser-js";
import { getMessages, addMessage, buildMessageTree } from "@/utils/local-db";
import type { CreateMessageDto, DeviceInfo } from "@/types/message";

export const prerender = false;

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

		const { slug, content, nickname, email, website, parentId } = body;

		if (!slug || !content || !nickname || !email) {
			return new Response(JSON.stringify({ error: "Missing required fields" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		const uaString = request.headers.get("user-agent") || "";
		const parser = new UAParser(uaString);
		const browser = parser.getBrowser();
		const os = parser.getOS();
		const device = parser.getDevice();

		const deviceInfo: DeviceInfo = {
			browser: browser.name ? `${browser.name} ${browser.version || ""}`.trim() : null,
			os: os.name ? `${os.name} ${os.version || ""}`.trim() : null,
			device: device.model || null,
		};

		const avatar = `https://www.gravatar.com/avatar/${md5(email.toLowerCase().trim())}?d=identicon&s=64`;

		const message = await addMessage(
			{
				slug,
				content,
				nickname,
				email,
				website: website || null,
				avatar,
				parentId: parentId || null,
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

function md5(string: string): string {
	let hash = 0;
	for (let i = 0; i < string.length; i++) {
		const char = string.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash;
	}
	return Math.abs(hash).toString(16).padStart(32, "0");
}
