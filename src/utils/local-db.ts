import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { DeviceInfo, Message } from "@/types/message";
import { createClient } from "@vercel/kv";
import Redis from "ioredis";

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

const LOCAL_DB_PATH = path.join(__dirname, "../../data/messages.json");

type RawMessage = Record<string, unknown>;

function normalizeDeviceInfo(input: unknown): DeviceInfo {
	if (!input || typeof input !== "object") {
		return { browser: null, os: null, device: null };
	}
	const obj = input as Record<string, unknown>;
	return {
		browser: typeof obj.browser === "string" ? obj.browser : null,
		os: typeof obj.os === "string" ? obj.os : null,
		device: typeof obj.device === "string" ? obj.device : null,
	};
}

function normalizeMessage(input: unknown): Message | null {
	if (!input || typeof input !== "object") return null;
	const m = input as RawMessage;

	const id = typeof m.id === "string" ? m.id : "";
	const slug = typeof m.slug === "string" ? m.slug : "";
	const content = typeof m.content === "string" ? m.content : "";
	const nickname = typeof m.nickname === "string" ? m.nickname : "";
	const website = typeof m.website === "string" ? m.website : null;
	const avatar = typeof m.avatar === "string" ? m.avatar : "";
	const createdAt =
		typeof m.createdAt === "string" ? m.createdAt : new Date().toISOString();
	const parentId = typeof m.parentId === "string" ? m.parentId : null;
	const device = normalizeDeviceInfo(m.device);

	if (!id || !slug || !nickname) return null;

	return {
		id,
		slug,
		content,
		nickname,
		website,
		avatar,
		device,
		createdAt,
		parentId,
	};
}

function normalizeMessageArray(input: unknown): Message[] {
	if (!Array.isArray(input)) return [];
	const out: Message[] = [];
	for (const item of input) {
		const msg = normalizeMessage(item);
		if (msg) out.push(msg);
	}
	return out;
}

async function readLocalFile(): Promise<Message[]> {
	try {
		const data = await fs.readFile(LOCAL_DB_PATH, "utf-8");
		return normalizeMessageArray(JSON.parse(data));
	} catch {
		return [];
	}
}

async function writeLocalFile(messages: Message[]): Promise<void> {
	await fs.mkdir(path.dirname(LOCAL_DB_PATH), { recursive: true });
	await fs.writeFile(LOCAL_DB_PATH, JSON.stringify(messages, null, 2));
}

function generateId(): string {
	return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export async function getMessages(slug?: string): Promise<Message[]> {
	let messages: Message[] = [];

	if (USE_VERCEL_KV && kvClient) {
		messages = normalizeMessageArray(await kvClient.get("messages"));
	} else if (USE_REDIS_URL && redisClient) {
		const data = await redisClient.get("messages");
		messages = data ? normalizeMessageArray(JSON.parse(data)) : [];
	} else {
		messages = await readLocalFile();
	}

	if (slug) {
		return messages.filter((m) => m.slug === slug);
	}
	return messages;
}

export async function addMessage(
	message: Omit<Message, "id" | "createdAt" | "device">,
	deviceInfo: DeviceInfo,
): Promise<Message> {
	const newMessage: Message = {
		...message,
		id: generateId(),
		createdAt: new Date().toISOString(),
		device: deviceInfo,
	};

	const messages = await getMessages();
	messages.push(newMessage);

	if (USE_VERCEL_KV && kvClient) {
		await kvClient.set("messages", messages);
	} else if (USE_REDIS_URL && redisClient) {
		await redisClient.set("messages", JSON.stringify(messages));
	} else {
		await writeLocalFile(messages);
	}

	return newMessage;
}

export function buildMessageTree(messages: Message[]): Message[] {
	const idToMessage = new Map<string, Message>();
	const roots: Message[] = [];

	for (const message of messages) {
		idToMessage.set(message.id, { ...message, replies: [] });
	}

	for (const message of messages) {
		const msg = idToMessage.get(message.id);
		if (!msg) continue;

		if (message.parentId) {
			const parent = idToMessage.get(message.parentId);
			if (parent) {
				parent.replies?.push(msg);
			}
		} else {
			roots.push(msg);
		}
	}

	roots.sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);

	return roots;
}
