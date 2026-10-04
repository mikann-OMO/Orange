import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
	const redisStore = new Map<string, string>();
	return {
		redisStore,
		redisGet: vi.fn(async (key: string) => redisStore.get(key) ?? null),
		redisSet: vi.fn(async (key: string, value: string) => {
			redisStore.set(key, value);
		}),
	};
});

vi.mock("@vercel/kv", () => ({
	createClient: () => ({ get: async () => null, set: async () => {} }),
}));

vi.mock("ioredis", () => ({
	default: class {
		on() {}
		get(key: string) {
			return h.redisGet(key);
		}
		set(key: string, value: string) {
			return h.redisSet(key, value);
		}
	},
}));

async function loadVisitor() {
	vi.stubEnv("REDIS_URL", "redis://localhost:6379");
	vi.stubEnv("KV_REST_API_URL", "");
	vi.stubEnv("KV_REST_API_TOKEN", "");
	vi.resetModules();
	return await import("../../src/pages/api/visitor");
}

function req(url: string) {
	return {
		url,
		headers: { get: () => null },
		json: async () => undefined,
	} as unknown as Request;
}

beforeEach(() => {
	h.redisStore.clear();
	h.redisGet.mockClear();
	h.redisSet.mockClear();
});

afterEach(() => {
	vi.unstubAllEnvs();
	vi.resetModules();
});

describe("访客计数（visitor API）", () => {
	it("正常增加访客数", async () => {
		const { POST } = await loadVisitor();
		await POST({ request: req("http://x/api/visitor?op=inc&key=site_visitor") });
		const second = await POST({ request: req("http://x/api/visitor?op=inc&key=site_visitor") });
		const data = await second.json();
		expect(data.count).toBe(2);
	});

	it("不存在的 key 返回 0", async () => {
		const { GET } = await loadVisitor();
		const res = await GET({ request: req("http://x/api/visitor?op=get&key=nope") });
		const data = await res.json();
		expect(data.count).toBe(0);
	});

	it("Redis 读取失败返回 500", async () => {
		h.redisGet.mockRejectedValueOnce(new Error("read boom"));
		const { GET } = await loadVisitor();
		const res = await GET({ request: req("http://x/api/visitor?op=get&key=x") });
		expect(res.status).toBe(500);
	});

	it("Redis 写入失败返回 500", async () => {
		h.redisSet.mockRejectedValueOnce(new Error("write boom"));
		const { POST } = await loadVisitor();
		const res = await POST({ request: req("http://x/api/visitor?op=inc&key=x") });
		expect(res.status).toBe(500);
	});
});
