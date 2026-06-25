import type { APIRoute } from "astro";
import { XMLParser } from "fast-xml-parser";

export const prerender = false;

type RecentUpdate = {
	title: string;
	url: string;
	date: string;
	platform: string;
	description: string;
};

type Source = {
	platform: string;
	feeds: string[];
};

const xiaohongshuFeed = process.env.XIAOHONGSHU_RSS_URL;

const sources: Source[] = [
	{
		platform: "Twitter / X",
		feeds: [
			"https://rsshub.app/twitter/user/YueOrange12019",
			"https://rsshub.rssforever.com/twitter/user/YueOrange12019",
		],
	},
	{
		platform: "知乎",
		feeds: [
			"https://rsshub.app/zhihu/people/activities/pxlswae",
			"https://rsshub.rssforever.com/zhihu/people/activities/pxlswae",
		],
	},
	{
		platform: "Bilibili",
		feeds: [
			"https://rsshub.app/bilibili/user/dynamic/3690987452893185",
			"https://rsshub.rssforever.com/bilibili/user/dynamic/3690987452893185",
			"https://rsshub.app/bilibili/user/video/3690987452893185",
			"https://rsshub.rssforever.com/bilibili/user/video/3690987452893185",
		],
	},
	{
		platform: "小红书",
		feeds: xiaohongshuFeed
			? [xiaohongshuFeed]
			: [
				"https://rsshub.app/xiaohongshu/user/6667f50a0000000003032ab1/notes",
				"https://rsshub.rssforever.com/xiaohongshu/user/6667f50a0000000003032ab1/notes",
			],
	},
];

const parser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: "@_",
	processEntities: false,
});

function extractText(value: unknown): string {
	if (value == null) return "";
	if (typeof value === "string") return value;
	if (typeof value === "number") return String(value);
	if (typeof value === "object") {
		const obj = value as Record<string, unknown>;
		if (typeof obj["#text"] === "string") return obj["#text"];
		if (typeof obj._ === "string") return obj._;
		if (typeof obj["@_href"] === "string") return obj["@_href"];
	}
	return "";
}

function normalizeItems(value: unknown): Record<string, unknown>[] {
	if (Array.isArray(value)) return value as Record<string, unknown>[];
	if (value && typeof value === "object") return [value as Record<string, unknown>];
	return [];
}

function stripHtml(value: string): string {
	return value.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function extractLink(value: unknown): string {
	if (Array.isArray(value)) {
		const alternate = value.find((item) => item?.["@_rel"] === "alternate") ?? value[0];
		return extractText(alternate);
	}
	return extractText(value);
}

function extractDate(item: Record<string, unknown>): string {
	const raw = extractText(item.pubDate) || extractText(item.published) || extractText(item.updated) || extractText(item["dc:date"]);
	const timestamp = raw ? new Date(raw).getTime() : Number.NaN;
	return Number.isNaN(timestamp) ? new Date().toISOString() : new Date(timestamp).toISOString();
}

function parseFeed(xml: string, platform: string): RecentUpdate[] {
	const parsed = parser.parse(xml);
	const rssItems = normalizeItems(parsed?.rss?.channel?.item);
	const atomEntries = normalizeItems(parsed?.feed?.entry);
	const items = rssItems.length > 0 ? rssItems : atomEntries;

	return items.map((item) => ({
		title: extractText(item.title) || "无标题更新",
		url: extractLink(item.link) || extractText(item.guid) || extractText(item.id),
		date: extractDate(item),
		platform,
		description: stripHtml(extractText(item.description) || extractText(item.summary) || extractText(item.content)),
	}));
}

async function fetchSource(source: Source): Promise<RecentUpdate[]> {
	for (const feed of source.feeds) {
		try {
			const res = await fetch(feed, {
				headers: {
					"user-agent": "orange-blog/1.0",
					accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
				},
				signal: AbortSignal.timeout(8000),
			});
			if (!res.ok) continue;
			const updates = parseFeed(await res.text(), source.platform);
			if (updates.length > 0) return updates;
		} catch {
			continue;
		}
	}
	return [];
}

export const GET: APIRoute = async () => {
	const results = await Promise.allSettled(sources.map(fetchSource));
	const updates = results
		.flatMap((result) => (result.status === "fulfilled" ? result.value : []))
		.filter((update) => update.url)
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, 10);

	return new Response(JSON.stringify({ updates }), {
		headers: {
			"content-type": "application/json; charset=utf-8",
			"cache-control": "s-maxage=300, stale-while-revalidate=600",
		},
	});
};
