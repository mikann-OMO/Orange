import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// 模拟数据层，隔离出 messages.ts 的校验逻辑
const h = vi.hoisted(() => ({
	addMessage: vi.fn(async (msg: Record<string, unknown>) => ({
		id: "test-id",
		createdAt: 123,
		...msg,
	})),
	getMessages: vi.fn(async () => []),
}));

vi.mock("../../src/utils/local-db", () => ({
	addMessage: h.addMessage,
	getMessages: h.getMessages,
}));

import { POST } from "../../src/pages/api/messages";

// 构造一个只满足处理器所需字段的请求对象
function req(body?: unknown) {
	return {
		url: "http://localhost/api/messages",
		headers: { get: () => null },
		json: async () => body,
	} as unknown as Request;
}

beforeEach(() => {
	h.addMessage.mockClear();
	h.getMessages.mockClear();
});

afterEach(() => {
	vi.resetModules();
});

describe("留言提交校验（messages API）", () => {
	it("缺少昵称时返回 400", async () => {
		const res = await POST({ request: req({ content: "hi" }) });
		expect(res.status).toBe(400);
	});

	it("缺少内容时返回 400", async () => {
		const res = await POST({ request: req({ nickname: "n" }) });
		expect(res.status).toBe(400);
	});

	it("QQ 号格式不正确时返回 400", async () => {
		const res = await POST({ request: req({ nickname: "n", content: "hi", qq: "abc" }) });
		expect(res.status).toBe(400);
		const data = await res.json();
		expect(data.error).toContain("QQ");
	});

	it("邮箱格式不正确时返回 400", async () => {
		const res = await POST({
			request: req({ nickname: "n", content: "hi", email: "not-an-email" }),
		});
		expect(res.status).toBe(400);
		const data = await res.json();
		expect(data.error).toContain("邮箱");
	});

	it("超长昵称被截断到 20 字", async () => {
		const res = await POST({
			request: req({ nickname: "y".repeat(50), content: "hi" }),
		});
		expect(res.status).toBe(201);
		const arg = h.addMessage.mock.calls[0][0];
		expect(arg.nickname).toHaveLength(20);
	});

	it("超长内容被截断到 500 字", async () => {
		const res = await POST({
			request: req({ nickname: "n", content: "x".repeat(600) }),
		});
		expect(res.status).toBe(201);
		const arg = h.addMessage.mock.calls[0][0];
		expect(arg.content).toHaveLength(500);
	});

	it("合法提交会调用 addMessage 并返回 201", async () => {
		const res = await POST({
			request: req({ nickname: "小明", content: "你好", email: "a@b.com" }),
		});
		expect(res.status).toBe(201);
		expect(h.addMessage).toHaveBeenCalledTimes(1);
	});
});
