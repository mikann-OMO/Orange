import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// 用内存 Map 模拟 Redis 存储，避免测试写入真实数据库或文件
const h = vi.hoisted(() => {
	const redisStore = new Map<string, string>();
	const kvStore = new Map<string, unknown>();
	return {
		redisStore,
		kvStore,
		redisGet: vi.fn(async (key: string) => redisStore.get(key) ?? null),
		redisSet: vi.fn(async (key: string, value: string) => {
			redisStore.set(key, value);
		}),
		kvGet: vi.fn(async (key: string) => kvStore.get(key)),
		kvSet: vi.fn(async (key: string, value: unknown) => {
			kvStore.set(key, value);
		}),
	};
});

vi.mock("@vercel/kv", () => ({
	createClient: () => ({ get: h.kvGet, set: h.kvSet }),
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

// 每次加载都重新初始化模块，确保走 ioredis（REDIS_URL）路径
async function loadLocalDb() {
	vi.stubEnv("REDIS_URL", "redis://localhost:6379");
	vi.stubEnv("KV_REST_API_URL", "");
	vi.stubEnv("KV_REST_API_TOKEN", "");
	vi.resetModules();
	return await import("../../src/utils/local-db");
}

beforeEach(() => {
	h.redisStore.clear();
	h.kvStore.clear();
	h.redisGet.mockClear();
	h.redisSet.mockClear();
	h.kvGet.mockClear();
	h.kvSet.mockClear();
});

afterEach(() => {
	vi.unstubAllEnvs();
	vi.resetModules();
});

describe("留言板存储（local-db）", () => {
	it("正常新增留言", async () => {
		const { addMessage, getMessages } = await loadLocalDb();

		const created = await addMessage({ nickname: "小明", content: "你好", avatar: "/a.webp" });

		expect(created.id).toBeTruthy();
		expect(created.createdAt).toBeTypeOf("number");

		const all = await getMessages();
		expect(all).toHaveLength(1);
		expect(all[0].nickname).toBe("小明");
	});

	it("正常读取留言，并按 slug 过滤", async () => {
		const { addMessage, getMessages } = await loadLocalDb();

		await addMessage({ nickname: "a", content: "1", avatar: "/a.webp", slug: "post-1" });
		await addMessage({ nickname: "b", content: "2", avatar: "/a.webp", slug: "post-2" });

		const filtered = await getMessages("post-1");
		expect(filtered).toHaveLength(1);
		expect(filtered[0].slug).toBe("post-1");
	});

	it("回复留言：保留 parentId", async () => {
		const { addMessage, getMessages } = await loadLocalDb();

		const parent = await addMessage({ nickname: "a", content: "主留言", avatar: "/a.webp" });
		await addMessage({
			nickname: "b",
			content: "回复",
			avatar: "/a.webp",
			parentId: parent.id,
		});

		const all = await getMessages();
		const reply = all.find((m) => m.parentId === parent.id);
		expect(reply).toBeTruthy();
		expect(reply?.content).toBe("回复");
	});

	it("超过 2000 条后，总数仍保持 2000，新留言在最前", async () => {
		const { addMessage, getMessages } = await loadLocalDb();

		const seed = Array.from({ length: 2000 }, (_, i) => ({
			id: `old-${i}`,
			nickname: "n",
			content: "c",
			avatar: "/a.webp",
			createdAt: i,
		}));
		h.redisStore.set("messages", JSON.stringify(seed));

		const newest = await addMessage({ nickname: "new", content: "new", avatar: "/a.webp" });

		const all = await getMessages();
		expect(all).toHaveLength(2000);
		expect(all[0].id).toBe(newest.id);
	});

	it("Redis 读取失败时返回空数组", async () => {
		h.redisGet.mockRejectedValueOnce(new Error("read boom"));

		const { getMessages } = await loadLocalDb();

		await expect(getMessages()).resolves.toEqual([]);
	});

	it("Redis 写入失败时 addMessage 抛错", async () => {
		h.redisSet.mockRejectedValueOnce(new Error("write boom"));

		const { addMessage } = await loadLocalDb();

		await expect(
			addMessage({ nickname: "a", content: "hi", avatar: "/a.webp" }),
		).rejects.toThrow("write boom");
	});
});
