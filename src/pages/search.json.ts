import type { APIRoute } from "astro";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import { getSortedPosts } from "../utils/content-utils";

const parser = new MarkdownIt();

export const GET: APIRoute = async () => {
	const blog = await getSortedPosts();

	const articles = blog.map((post) => {
		const content =
			typeof post.body === "string" ? post.body : String(post.body || "");
		const html = parser.render(content);
		// 移除所有 HTML 标签，只保留纯文本
		const plainText = sanitizeHtml(html, {
			allowedTags: [],
			allowedAttributes: {},
		})
			.replace(/\s+/g, " ")
			.trim();

		return {
			title: post.data.title,
			description: post.data.description || plainText.slice(0, 160),
			date: post.data.published,
			slug: post.slug,
			url: `/posts/${post.slug}/`,
			content: plainText,
		};
	});

	return new Response(JSON.stringify(articles), {
		headers: {
			"Content-Type": "application/json; charset=utf-8",
		},
	});
};
