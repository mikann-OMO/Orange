import { getCollection } from "astro:content";
import I18nKey from "../i18n/i18nKey.ts";
import { i18n } from "../i18n/translation.ts";

// 复用获取博客文章的函数，避免重复查询
export async function getAllPublishedPosts(): Promise<
	ReturnType<typeof getCollection<"posts">>
> {
	return getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
}

export async function getSortedPosts(): Promise<
	ReturnType<typeof getCollection<"posts">>
> {
	const allBlogPosts = await getAllPublishedPosts();

	// 使用稳定排序算法，先按日期倒序，再按标题正序
	return allBlogPosts
		.sort((a, b) => {
			const dateA = new Date(a.data.published).getTime();
			const dateB = new Date(b.data.published).getTime();
			if (dateA !== dateB) {
				return dateB - dateA; // 日期倒序
			}
			return a.data.title.localeCompare(b.data.title); // 标题正序
		})
		.map((post, index, array) => {
			// 同时设置前后文章，减少一次循环
			if (index > 0) {
				post.data.nextSlug = array[index - 1].slug;
				post.data.nextTitle = array[index - 1].data.title;
			}
			if (index < array.length - 1) {
				post.data.prevSlug = array[index + 1].slug;
				post.data.prevTitle = array[index + 1].data.title;
			}
			return post;
		});
}

export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(): Promise<Tag[]> {
	const allBlogPosts = await getAllPublishedPosts();
	const countMap = new Map<string, number>();

	// 使用 for...of 替代 forEach，提高性能
	for (const post of allBlogPosts) {
		const tags = post.data.tags;
		if (tags) {
			for (const tag of tags) {
				countMap.set(tag, (countMap.get(tag) || 0) + 1);
			}
		}
	}

	// 转换为数组并排序
	return Array.from(countMap.entries())
		.sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()))
		.map(([name, count]) => ({ name, count }));
}

export type Category = {
	name: string;
	count: number;
};

export async function getCategoryList(): Promise<Category[]> {
	const allBlogPosts = await getAllPublishedPosts();
	const countMap = new Map<string, number>();
	const uncategorizedKey = i18n(I18nKey.uncategorized);

	// 使用 for...of 替代 forEach，提高性能
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
		countMap.set(categoryName, (countMap.get(categoryName) || 0) + 1);
	}

	// 转换为数组并排序
	return Array.from(countMap.entries())
		.sort(([a], [b]) => a.toLowerCase().localeCompare(b.toLowerCase()))
		.map(([name, count]) => ({ name, count }));
}
