import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
	const kvCounters = new Map<string, number>();
	const redisCounters = new Map<string, number>();
	return {
		kvCounters,
		redisCounters,
		kvIncr: vi.fn(async (key: string) => {
			const next = (kvCounters.get(key) ?? 0) + 1;
			kvCounters.set(key, next);
			return next;
		}),
		kvExpire: vi.fn(async () => true),
		redisIncr: vi.fn(async (key: string) => {
			const next = (redisCounters.get(key) ?? 0) + 1;
			redisCounters.set(key, next);
			return next;
		}),
		redisExpire: vi.fn(async () => 1),
	};
});

vi.mock("@vercel/kv", () => ({
	createClient: () => ({ incr: h.kvIncr, expire: h.kvExpire }),
}));

vi.mock("ioredis", () => ({
	default: class {
		on() {}
		incr(key: string) {
			return h.redisIncr(key);
		}
		expire(key: string, seconds: number) {
			return h.redisExpire(key, seconds);
		}
	},
}));

async function loadRateLimit() {
	vi.resetModules();
	return await import("../../src/utils/rate-limit");
}

function stubKv() {
	vi.stubEnv("KV_REST_API_URL", "https://fake.upstash.io");
	vi.stubEnv("KV_REST_API_TOKEN", "fake-token");
	vi.stubEnv("REDIS_URL", "");
}

function stubRedis() {
	vi.stubEnv("KV_REST_API_URL", "");
	vi.stubEnv("KV_REST_API_TOKEN", "");
	vi.stubEnv("REDIS_URL", "redis://localhost:6379");
}

function stubLocal() {
	vi.stubEnv("KV_REST_API_URL", "");
	vi.stubEnv("KV_REST_API_TOKEN", "");
	vi.stubEnv("REDIS_URL", "");
}

beforeEach(() => {
	h.kvCounters.clear();
	h.redisCounters.clear();
	h.kvIncr.mockClear();
	h.kvExpire.mockClear();
	h.redisIncr.mockClear();
	h.redisExpire.mockClear();
});

afterEach(() => {
	vi.unstubAllEnvs();
	vi.resetModules();
});

describe("限流（rate-limit）", () => {
	it("在限制内允许通过", async () => {
		stubKv();
		const { checkRateLimit } = await loadRateLimit();

		await expect(checkRateLimit("test", 5, 3600)).resolves.toBe(true);
		await expect(checkRateLimit("test", 5, 3600)).resolves.toBe(true);
	});

	it("超过限制后拒绝", async () => {
		stubKv();
		const { checkRateLimit } = await loadRateLimit();

		for (let i = 0; i < 5; i++) {
			await expect(checkRateLimit("bucket", 5, 3600)).resolves.toBe(true);
		}
		await expect(checkRateLimit("bucket", 5, 3600)).resolves.toBe(false);
	});

	it("Redis 路径同样限流", async () => {
		stubRedis();
		const { checkRateLimit } = await loadRateLimit();

		for (let i = 0; i < 3; i++) {
			await expect(checkRateLimit("r", 3, 3600)).resolves.toBe(true);
		}
		await expect(checkRateLimit("r", 3, 3600)).resolves.toBe(false);
	});

	it("本地（无 KV/Redis）路径也能计数", async () => {
		stubLocal();
		const { checkRateLimit } = await loadRateLimit();

		await expect(checkRateLimit("local", 2, 3600)).resolves.toBe(true);
		await expect(checkRateLimit("local", 2, 3600)).resolves.toBe(true);
		await expect(checkRateLimit("local", 2, 3600)).resolves.toBe(false);
	});

	it("getClientIp 提取 x-forwarded-for 首个 IP", async () => {
		stubLocal();
		const { getClientIp } = await loadRateLimit();
		const req = {
			headers: {
				get: (name: string) =>
					name === "x-forwarded-for" ? "1.2.3.4, 5.6.7.8" : null,
			},
		} as unknown as Request;

		expect(getClientIp(req)).toBe("1.2.3.4");
	});
});
