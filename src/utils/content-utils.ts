import { getCollection } from "astro:content";
import I18nKey from "../i18n/i18nKey.ts";
import { i18n } from "../i18n/translation.ts";

export async function getSortedPosts(): Promise<
	Awaited<ReturnType<typeof getCollection<"posts">>>
> {
	const allBlogPosts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	// 优化排序逻辑，提前计算日期以避免重复调用 new Date()
	const sorted = allBlogPosts.sort((a, b) => {
		const timeA = new Date(a.data.published).getTime();
		const timeB = new Date(b.data.published).getTime();
		if (timeA !== timeB) {
			return timeB - timeA; // 降序排列
		}
		// 如果日期相同，根据标题排序以确保顺序一致
		return a.data.title.localeCompare(b.data.title);
	});

	// 合并循环，减少遍历次数
	for (let i = 0; i < sorted.length; i++) {
		if (i < sorted.length - 1) {
			sorted[i].data.prevSlug = sorted[i + 1].slug;
			sorted[i].data.prevTitle = sorted[i + 1].data.title;
		}
		if (i > 0) {
			sorted[i].data.nextSlug = sorted[i - 1].slug;
			sorted[i].data.nextTitle = sorted[i - 1].data.title;
		}
	}

	return sorted;
}

export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(): Promise<Tag[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const countMap: { [key: string]: number } = {};
	// 使用 for...of 循环替代 forEach 以提高性能
	for (const post of allBlogPosts) {
		for (const tag of post.data.tags) {
			countMap[tag] = (countMap[tag] || 0) + 1;
		}
	}

	// 直接返回排序后的结果，避免中间变量
	return Object.keys(countMap)
		.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
		.map((key) => ({ name: key, count: countMap[key] }));
}

export type Category = {
	name: string;
	count: number;
};

export async function getCategoryList(): Promise<Category[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const count: { [key: string]: number } = {};
	const uncategorizedKey = i18n(I18nKey.uncategorized);

	// 使用 for...of 循环替代 forEach 以提高性能
	for (const post of allBlogPosts) {
		let categoryName: string;

		if (!post.data.category) {
			categoryName = uncategorizedKey;
		} else {
			categoryName =
				typeof post.data.category === "string"
					? post.data.category.trim()
					: String(post.data.category).trim();
		}

		count[categoryName] = (count[categoryName] || 0) + 1;
	}

	// 直接返回排序后的结果，避免中间变量和循环
	return Object.keys(count)
		.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
		.map((key) => ({ name: key, count: count[key] }));
}
