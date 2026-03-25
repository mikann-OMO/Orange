import { getCollection } from "astro:content";

// 静态生成搜索索引JSON文件
export async function get() {
	const posts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const searchIndex = posts.map((post) => ({
		title: post.data.title,
		url: `/posts/${post.slug}`,
		description: post.data.description || "",
		category: post.data.category || "",
		tags: post.data.tags || [],
		body: post.body || "",
	}));

	return {
		body: JSON.stringify(searchIndex),
		headers: {
			"Content-Type": "application/json",
		},
	};
}

// 预渲染为静态文件
export const prerender = true;
