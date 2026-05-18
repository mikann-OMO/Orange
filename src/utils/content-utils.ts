import { getCollection } from "astro:content";
import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";

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
			sorted[i].data.prevSlug = sorted[i + 1].id;
			sorted[i].data.prevTitle = sorted[i + 1].data.title;
		}
		if (i > 0) {
			sorted[i].data.nextSlug = sorted[i - 1].id;
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

export async function getNoteTagList(): Promise<Tag[]> {
	const allNotes = await getCollection<"notes">("notes", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const countMap: { [key: string]: number } = {};
	for (const note of allNotes) {
		if (note.data.tags) {
			for (const tag of note.data.tags) {
				countMap[tag] = (countMap[tag] || 0) + 1;
			}
		}
	}

	return Object.keys(countMap)
		.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
		.map((key) => ({ name: key, count: countMap[key] }));
}

export async function getNoteCategoryList(): Promise<Category[]> {
	const allNotes = await getCollection<"notes">("notes", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const count: { [key: string]: number } = {};
	const uncategorizedKey = i18n(I18nKey.uncategorized);

	for (const note of allNotes) {
		let categoryName: string;

		if (!note.data.category) {
			categoryName = uncategorizedKey;
		} else {
			categoryName =
				typeof note.data.category === "string"
					? note.data.category.trim()
					: String(note.data.category).trim();
		}

		count[categoryName] = (count[categoryName] || 0) + 1;
	}

	return Object.keys(count)
		.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
		.map((key) => ({ name: key, count: count[key] }));
}

// ==================== 归档页工具函数 ====================

/** 从原始 markdown body 粗略统计字数（中英文混合） */
function countWords(body: string): number {
	if (!body) return 0;
	// 去除 markdown 语法标记（图片、链接、标题符号、代码块等）
	const cleaned = body
		.replace(/```[\s\S]*?```/g, "") // 代码块
		.replace(/`[^`]+`/g, "") // 行内代码
		.replace(/!\[.*?\]\(.*?\)/g, "") // 图片
		.replace(/\[([^\]]*)\]\(.*?\)/g, "$1") // 链接保留文字
		.replace(/^#{1,6}\s+/gm, "") // 标题标记
		.replace(/^[-*_]{3,}\s*$/gm, "") // 分割线
		.replace(/^>\s+/gm, "") // 引用标记
		.replace(/[*_~]+/g, "") // 斜体粗体标记
		.replace(/<[^>]+>/g, "") // HTML 标签
		.replace(/---\ntitle[\s\S]*?---/g, ""); // frontmatter

	// 中文字符数 + 英文单词数
	const chineseChars = (cleaned.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;
	const englishWords = cleaned
		.replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, " ")
		.split(/\s+/)
		.filter((w) => w.length > 0).length;

	return chineseChars + englishWords;
}

export type ArchiveItem = {
	id: string;
	title: string;
	published: Date;
	tags: string[];
	category: string;
	url: string;
	type: "post" | "note";
	words: number;
};

export type ArchiveMonthGroup = {
	month: number;
	items: ArchiveItem[];
};

export type ArchiveYearGroup = {
	year: number;
	months: ArchiveMonthGroup[];
	postCount: number;
	noteCount: number;
};

export type ArchiveStats = {
	totalWords: number;
	postCount: number;
	noteCount: number;
	totalCount: number;
	yearsSpan: string;
	allTags: Tag[];
	allCategories: Category[];
};

/** 获取合并后的归档数据（posts + notes），按时间倒序 */
export async function getArchiveData(): Promise<{
	groups: ArchiveYearGroup[];
	stats: ArchiveStats;
}> {
	const [posts, notes] = await Promise.all([
		getCollection("posts", ({ data }) => (import.meta.env.PROD ? data.draft !== true : true)),
		getCollection("notes", ({ data }) => (import.meta.env.PROD ? data.draft !== true : true)),
	]);

	// 构建归档条目
	const items: ArchiveItem[] = [];

	for (const post of posts) {
		const body = typeof post.body === "string" ? post.body : String(post.body || "");
		items.push({
			id: post.id,
			title: post.data.title,
			published: new Date(post.data.published),
			tags: post.data.tags || [],
			category: post.data.category || "",
			url: `/posts/${post.id}/`,
			type: "post",
			words: countWords(body),
		});
	}

	for (const note of notes) {
		const body = typeof note.body === "string" ? note.body : String(note.body || "");
		items.push({
			id: note.id,
			title: note.data.title || "无标题",
			published: new Date(note.data.published),
			tags: note.data.tags || [],
			category: note.data.category || "",
			url: `/bits/${note.id}/`,
			type: "note",
			words: countWords(body),
		});
	}

	// 按时间倒序排序
	items.sort((a, b) => b.published.getTime() - a.published.getTime());

	// 按年 > 月分组
	const yearMap = new Map<number, Map<number, ArchiveItem[]>>();
	for (const item of items) {
		const year = item.published.getFullYear();
		const month = item.published.getMonth() + 1;
		if (!yearMap.has(year)) yearMap.set(year, new Map());
		const monthMap = yearMap.get(year)!;
		if (!monthMap.has(month)) monthMap.set(month, []);
		monthMap.get(month)!.push(item);
	}

	const groups: ArchiveYearGroup[] = [];
	for (const [year, monthMap] of yearMap) {
		const months: ArchiveMonthGroup[] = [];
		let postCount = 0;
		let noteCount = 0;
		for (const [month, monthItems] of monthMap) {
			months.push({ month, items: monthItems });
			for (const it of monthItems) {
				if (it.type === "post") postCount++;
				else noteCount++;
			}
		}
		months.sort((a, b) => b.month - a.month);
		groups.push({ year, months, postCount, noteCount });
	}
	groups.sort((a, b) => b.year - a.year);

	// 统计
	const totalWords = items.reduce((sum, it) => sum + it.words, 0);
	const postCount = items.filter((it) => it.type === "post").length;
	const noteCount = items.filter((it) => it.type === "note").length;

	const years = groups.map((g) => g.year);
	const yearsSpan = years.length > 0 ? `${years[years.length - 1]} - ${years[0]}` : "-";

	// 汇总所有标签和分类（posts + notes 合并）
	const tagCountMap: { [key: string]: number } = {};
	const catCountMap: { [key: string]: number } = {};
	const uncategorizedKey = i18n(I18nKey.uncategorized);

	for (const item of items) {
		for (const tag of item.tags) {
			tagCountMap[tag] = (tagCountMap[tag] || 0) + 1;
		}
		const catName = item.category || uncategorizedKey;
		catCountMap[catName] = (catCountMap[catName] || 0) + 1;
	}

	const allTags: Tag[] = Object.keys(tagCountMap)
		.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
		.map((key) => ({ name: key, count: tagCountMap[key] }));

	const allCategories: Category[] = Object.keys(catCountMap)
		.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
		.map((key) => ({ name: key, count: catCountMap[key] }));

	return {
		groups,
		stats: {
			totalWords,
			postCount,
			noteCount,
			totalCount: postCount + noteCount,
			yearsSpan,
			allTags,
			allCategories,
		},
	};
}
