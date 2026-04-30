import type { APIRoute } from "astro";
import { createClient } from "@vercel/kv";
import Redis from "ioredis";

export const prerender = false;

type CheckResult = {
	ok: boolean;
	error?: string;
};

async function checkKv(): Promise<CheckResult> {
	const hasUrl = !!process.env.KV_REST_API_URL;
	const hasToken = !!process.env.KV_REST_API_TOKEN;
	if (!hasUrl || !hasToken) {
		return { ok: false, error: "Missing KV_REST_API_URL or KV_REST_API_TOKEN" };
	}

	try {
		const kv = createClient({
			url: process.env.KV_REST_API_URL,
			token: process.env.KV_REST_API_TOKEN,
		});
		// A lightweight read to validate credentials/connectivity.
		await kv.get("healthcheck");
		return { ok: true };
	} catch (e) {
		return { ok: false, error: e instanceof Error ? e.message : String(e) };
	}
}

async function checkRedis(): Promise<CheckResult> {
	const url = process.env.REDIS_URL;
	if (!url) return { ok: false, error: "Missing REDIS_URL" };

	const redis = new Redis(url, {
		maxRetriesPerRequest: 1,
		enableReadyCheck: false,
	});
	try {
		await redis.ping();
		return { ok: true };
	} catch (e) {
		return { ok: false, error: e instanceof Error ? e.message : String(e) };
	} finally {
		try {
			redis.disconnect();
		} catch {
			// ignore
		}
	}
}

export const GET: APIRoute = async () => {
	const kvEnvPresent = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
	const redisEnvPresent = !!process.env.REDIS_URL;

	// Mirror your storage selection precedence: KV > Redis > local file
	const chosenStorage = kvEnvPresent ? "kv" : redisEnvPresent ? "redis" : "local-file";

	const [kv, redis] = await Promise.all([checkKv(), checkRedis()]);

	return new Response(
		JSON.stringify(
			{
				env: {
					kvConfigured: kvEnvPresent,
					redisConfigured: redisEnvPresent,
				},
				checks: {
					kv,
					redis,
				},
				chosenStorage,
				notes: [
					"This endpoint does not return any secrets.",
					"chosenStorage matches the current code path for messages/likes/visitor APIs.",
				],
			},
			null,
			2,
		),
		{
			status: 200,
			headers: { "Content-Type": "application/json; charset=utf-8" },
		},
	);
};

