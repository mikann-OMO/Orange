import type { APIRoute } from "astro";

interface KV {
	get(key: string): Promise<number | null>;
	incr(key: string): Promise<number>;
}

// 内存存储作为fallback
let fallbackLikes = 0;
// 检查是否使用fallback（默认使用fallback）
let useFallback = true;
let kv: KV | undefined;

try {
	const { kv: vercelKv } = await import("@vercel/kv");
	kv = vercelKv;
	// 尝试获取一个值来测试KV是否配置正确
	await kv.get("test");
	useFallback = false;
} catch (error) {
	// 本地开发时使用内存存储作为fallback
	useFallback = true;
}

export const prerender = false;

export const GET: APIRoute = async () => {
	let count = 0;

	if (useFallback) {
		count = fallbackLikes;
	} else if (kv) {
		try {
			count = (await kv.get("total_likes")) || 0;
		} catch {
			count = 0;
		}
	}

	return new Response(JSON.stringify({ count }), {
		headers: { "Content-Type": "application/json" },
	});
};

export const POST: APIRoute = async ({ request, cookies }) => {
	const hasLiked = cookies.get("has_liked");

	if (hasLiked) {
		return new Response(JSON.stringify({ message: "你已经点过赞啦！" }), {
			status: 400,
		});
	}

	let newCount = 0;

	if (useFallback) {
		newCount = ++fallbackLikes;
	} else if (kv) {
		try {
			newCount = await kv.incr("total_likes");
		} catch {
			// 出错时使用fallback
			newCount = ++fallbackLikes;
		}
	}

	const response = new Response(JSON.stringify({ count: newCount }), {
		headers: { "Content-Type": "application/json" },
	});

	cookies.set("has_liked", "true", {
		path: "/",
		maxAge: 31536000,
		httpOnly: true,
	});

	return response;
};
