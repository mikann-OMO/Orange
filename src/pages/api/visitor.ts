import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@vercel/kv";
import type { APIRoute } from "astro";
import Redis from "ioredis";

export const prerender = false;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USE_VERCEL_KV = !!(
	process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
);
const USE_REDIS_URL = !USE_VERCEL_KV && !!process.env.REDIS_URL;

const kvClient = USE_VERCEL_KV
	? createClient({
			url: process.env.KV_REST_API_URL,
			token: process.env.KV_REST_API_TOKEN,
		})
	: null;

const redisClient =
	USE_REDIS_URL && process.env.REDIS_URL
		? new Redis(process.env.REDIS_URL)
		: null;

const LOCAL_DB_PATH = path.join(__dirname, "../../../data/visitor.json");

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
		return ((await kvClient.get("visitor")) as Store) || {};
	}
	if (USE_REDIS_URL && redisClient) {
		const raw = await redisClient.get("visitor");
		return raw ? (JSON.parse(raw) as Store) : {};
	}
	return await readLocalFile();
}

async function setStore(store: Store): Promise<void> {
	if (USE_VERCEL_KV && kvClient) {
		await kvClient.set("visitor", store);
		return;
	}
	if (USE_REDIS_URL && redisClient) {
		await redisClient.set("visitor", JSON.stringify(store));
		return;
	}
	await writeLocalFile(store);
}

function normalizeKey(key: string): string {
	return key.trim().slice(0, 400);
}

export const GET: APIRoute = async ({ request }) => {
	try {
		const url = new URL(request.url);
		const op = url.searchParams.get("op") || "get";
		const key = normalizeKey(url.searchParams.get("key") || "");
		if (!key) {
			return new Response(JSON.stringify({ error: "Missing key" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}
		if (op !== "get") {
			return new Response(JSON.stringify({ error: "Invalid op" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		const store = await getStore();
		const count = store[key] || 0;
		return new Response(JSON.stringify({ key, count }), {
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
		const url = new URL(request.url);
		const op = url.searchParams.get("op") || "inc";
		const key = normalizeKey(url.searchParams.get("key") || "");
		if (!key) {
			return new Response(JSON.stringify({ error: "Missing key" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}
		if (op !== "inc") {
			return new Response(JSON.stringify({ error: "Invalid op" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		const store = await getStore();
		const next = (store[key] || 0) + 1;
		store[key] = next;
		await setStore(store);

		return new Response(JSON.stringify({ key, count: next }), {
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
