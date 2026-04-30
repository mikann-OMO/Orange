import type { APIRoute } from "astro";
import { createClient } from "@vercel/kv";
import Redis from "ioredis";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const prerender = false;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USE_VERCEL_KV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
const USE_REDIS_URL = !USE_VERCEL_KV && !!process.env.REDIS_URL;

const kvClient = USE_VERCEL_KV
	? createClient({
			url: process.env.KV_REST_API_URL,
			token: process.env.KV_REST_API_TOKEN,
		})
	: null;

const redisClient =
	USE_REDIS_URL && process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

const LOCAL_DB_PATH = path.join(__dirname, "../../../data/likes.json");

type Store = Record<string, number>;

async function readLocalFile(): Promise<Store> {
	try {
		const data = await fs.readFile(LOCAL_DB_PATH, "utf-8");
		const parsed = JSON.parse(data) as unknown;
		if (!parsed || typeof parsed !== "object") return {};
		return parsed as Store;
	} catch {
		return {};
	}
}

async function writeLocalFile(store: Store): Promise<void> {
	await fs.mkdir(path.dirname(LOCAL_DB_PATH), { recursive: true });
	await fs.writeFile(LOCAL_DB_PATH, JSON.stringify(store, null, 2), "utf-8");
}

async function getStore(): Promise<Store> {
	if (USE_VERCEL_KV && kvClient) {
		return ((await kvClient.get("likes")) as Store) || {};
	}
	if (USE_REDIS_URL && redisClient) {
		const raw = await redisClient.get("likes");
		return raw ? (JSON.parse(raw) as Store) : {};
	}
	return await readLocalFile();
}

async function setStore(store: Store): Promise<void> {
	if (USE_VERCEL_KV && kvClient) {
		await kvClient.set("likes", store);
		return;
	}
	if (USE_REDIS_URL && redisClient) {
		await redisClient.set("likes", JSON.stringify(store));
		return;
	}
	await writeLocalFile(store);
}

function normalizeSlug(slug: string): string {
	return slug.trim().replace(/\s+/g, " ").slice(0, 400);
}

export const GET: APIRoute = async ({ request }) => {
	try {
		const url = new URL(request.url);
		const slug = normalizeSlug(url.searchParams.get("slug") || "");
		if (!slug) {
			return new Response(JSON.stringify({ error: "Missing slug" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}
		const store = await getStore();
		return new Response(JSON.stringify({ slug, count: store[slug] || 0 }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch {
		return new Response(JSON.stringify({ error: "Failed" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};

export const POST: APIRoute = async ({ request }) => {
	try {
		const body = (await request.json()) as unknown;
		if (!body || typeof body !== "object") {
			return new Response(JSON.stringify({ error: "Invalid body" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}
		const obj = body as Record<string, unknown>;
		const slug = normalizeSlug(typeof obj.slug === "string" ? obj.slug : "");
		const delta = typeof obj.delta === "number" ? obj.delta : 0;

		if (!slug || (delta !== 1 && delta !== -1)) {
			return new Response(JSON.stringify({ error: "Invalid fields" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		const store = await getStore();
		const current = store[slug] || 0;
		const next = Math.max(0, current + delta);
		store[slug] = next;
		await setStore(store);

		return new Response(JSON.stringify({ slug, count: next }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch {
		return new Response(JSON.stringify({ error: "Failed" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};

