import { createClient } from "@vercel/kv";
import Redis from "ioredis";

const USE_VERCEL_KV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
const USE_REDIS_URL = !USE_VERCEL_KV && !!process.env.REDIS_URL;

let kvClient: ReturnType<typeof createClient> | null = null;
let redisClient: Redis | null = null;

if (USE_VERCEL_KV) {
	kvClient = createClient({
		url: process.env.KV_REST_API_URL!,
		token: process.env.KV_REST_API_TOKEN!,
	});
} else if (USE_REDIS_URL) {
	redisClient = new Redis(process.env.REDIS_URL!);
	redisClient.on("error", (err) => {
		console.error("Redis connection error:", err);
	});
}

// 本地开发（无 KV/Redis）时的进程内计数
const localCounters = new Map<string, number>();

// 从请求头提取客户端 IP（Vercel 会设置 x-forwarded-for / x-real-ip）
export function getClientIp(request: Request): string {
	const xff = request.headers.get("x-forwarded-for");
	if (xff) {
		const first = xff.split(",")[0]?.trim();
		if (first) return first;
	}
	return request.headers.get("x-real-ip") || "unknown";
}

// 固定窗口限流：用原子 INCR 计数，首次命中时设置过期时间
export async function checkRateLimit(
	bucket: string,
	limit: number,
	windowSeconds: number
): Promise<boolean> {
	const windowStart = Math.floor(Date.now() / (windowSeconds * 1000));
	const key = `rate:${bucket}:${windowStart}`;

	let count: number;
	if (USE_VERCEL_KV && kvClient) {
		count = await kvClient.incr(key);
		if (count === 1) await kvClient.expire(key, windowSeconds * 2);
	} else if (USE_REDIS_URL && redisClient) {
		count = await redisClient.incr(key);
		if (count === 1) await redisClient.expire(key, windowSeconds * 2);
	} else {
		count = (localCounters.get(key) ?? 0) + 1;
		localCounters.set(key, count);
	}

	return count <= limit;
}
