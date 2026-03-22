import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
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

	return new Response(JSON.stringify(searchIndex), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	});
};
