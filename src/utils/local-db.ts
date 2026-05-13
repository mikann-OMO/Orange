import fs from "node:fs";
import path from "node:path";
import { createClient } from "@vercel/kv";
import Redis from "ioredis";
import type { Message } from "../types/message";

const DB_PATH = path.join(process.cwd(), "data", "messages.json");

const USE_VERCEL_KV = !!(
	process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
);
const USE_REDIS_URL = !USE_VERCEL_KV && !!process.env.REDIS_URL;
const IS_REMOTE = USE_VERCEL_KV || USE_REDIS_URL;

let kvClient: ReturnType<typeof createClient> | null = null;
let redisClient: Redis | null = null;

if (USE_VERCEL_KV) {
	kvClient = createClient({
		url: process.env.KV_REST_API_URL!,
		token: process.env.KV_REST_API_TOKEN!,
	});
} else if (USE_REDIS_URL) {
	try {
		redisClient = new Redis(process.env.REDIS_URL!);
		redisClient.on("error", (err) => {
			console.error("Redis connection error:", err);
		});
	} catch (e) {
		console.error("Failed to initialize Redis client:", e);
	}
}

if (!IS_REMOTE && !fs.existsSync(path.dirname(DB_PATH))) {
	fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

if (!IS_REMOTE && !fs.existsSync(DB_PATH)) {
	fs.writeFileSync(DB_PATH, JSON.stringify([]));
}

export async function getMessages(slug?: string): Promise<Message[]> {
	try {
		let messages: Message[] = [];
		if (USE_VERCEL_KV && kvClient) {
			messages = (await kvClient.get<Message[]>("messages")) || [];
		} else if (USE_REDIS_URL && redisClient) {
			const raw = await redisClient.get("messages");
			messages = raw ? JSON.parse(raw) : [];
		} else if (fs.existsSync(DB_PATH)) {
			const data = fs.readFileSync(DB_PATH, "utf-8");
			messages = JSON.parse(data);
		}

		if (slug) {
			return messages.filter((m) => m.slug === slug);
		}
		return messages;
	} catch (error) {
		console.error("Failed to get messages:", error);
		return [];
	}
}

export async function addMessage(
	message: Omit<Message, "id" | "createdAt">,
): Promise<Message> {
	const messages = await getMessages();
	const newMessage: Message = {
		...message,
		id: Math.random().toString(36).substring(2, 9),
		createdAt: Date.now(),
	};
	messages.unshift(newMessage);

	if (messages.length > 2000) {
		messages.pop();
	}

	if (USE_VERCEL_KV && kvClient) {
		await kvClient.set("messages", messages);
	} else if (USE_REDIS_URL && redisClient) {
		await redisClient.set("messages", JSON.stringify(messages));
	} else {
		fs.writeFileSync(DB_PATH, JSON.stringify(messages, null, 2));
	}
	return newMessage;
}
