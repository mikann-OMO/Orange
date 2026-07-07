import { getCollection } from "astro:content";
import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";

export async function getSortedPosts(): Promise<
	Awaited<ReturnType<typeof getCollection<"posts">>>
> {
	const allBlogPosts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const sorted = allBlogPosts.sort((a, b) => {
		const timeA = new Date(a.data.published).getTime();
		const timeB = new Date(b.data.published).getTime();
		if (timeA !== timeB) {
			return timeB - timeA;
		}
		return a.data.title.localeCompare(b.data.title);
	});

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
	for (const post of allBlogPosts) {
		for (const tag of post.data.tags) {
			countMap[tag] = (countMap[tag] || 0) + 1;
		}
	}

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

function countWords(body: string): number {
	if (!body) return 0;
	const cleaned = body
		.replace(/```[\s\S]*?```/g, "")
		.replace(/`[^`]+`/g, "")
		.replace(/!\[.*?\]\(.*?\)/g, "")
		.replace(/\[([^\]]*)\]\(.*?\)/g, "$1")
		.replace(/^#{1,6}\s+/gm, "")
		.replace(/^[-*_]{3,}\s*$/gm, "")
		.replace(/^>\s+/gm, "")
		.replace(/[*_~]+/g, "")
		.replace(/<[^>]+>/g, "")
		.replace(/---\ntitle[\s\S]*?---/g, "");

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

export async function getArchiveData(
	filterOptions?: {
		categories?: string[];
		tags?: string[];
	},
): Promise<{
	groups: ArchiveYearGroup[];
	stats: ArchiveStats;
}> {
	const [posts, notes] = await Promise.all([
		getCollection("posts", ({ data }) => (import.meta.env.PROD ? data.draft !== true : true)),
		getCollection("notes", ({ data }) => (import.meta.env.PROD ? data.draft !== true : true)),
	]);

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

	items.sort((a, b) => b.published.getTime() - a.published.getTime());

	let filteredItems = items;
	if (filterOptions) {
		const { categories, tags } = filterOptions;
		filteredItems = items.filter((item) => {
			if (categories && categories.length > 0) {
				const itemCategory = item.category || i18n(I18nKey.uncategorized);
				if (!categories.includes(itemCategory)) return false;
			}
			if (tags && tags.length > 0) {
				if (!item.tags || !tags.some((t) => item.tags!.includes(t))) return false;
			}
			return true;
		});
	}

	const yearMap = new Map<number, Map<number, ArchiveItem[]>>();
	for (const item of filteredItems) {
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

	const totalWords = filteredItems.reduce((sum, it) => sum + it.words, 0);
	const postCount = filteredItems.filter((it) => it.type === "post").length;
	const noteCount = filteredItems.filter((it) => it.type === "note").length;

	const years = groups.map((g) => g.year);
	const yearsSpan = years.length > 0 ? `${years[years.length - 1]} - ${years[0]}` : "-";

	const tagCountMap: { [key: string]: number } = {};
	const catCountMap: { [key: string]: number } = {};
	const uncategorizedKey = i18n(I18nKey.uncategorized);

	for (const item of filteredItems) {
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
