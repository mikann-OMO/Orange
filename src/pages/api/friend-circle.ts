import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { XMLParser } from "fast-xml-parser";

export const prerender = false;

type FriendPost = {
	title: string;
	link: string;
	published: string;
	description: string;
	siteTitle: string;
	siteurl: string;
	avatar: string;
};

const parser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: "@_",
	processEntities: false,
});

const FEED_PATHS = ["/feed.xml", "/rss.xml", "/atom.xml", "/feed", "/rss", "/feed/", "/atom/", "/index.xml"];

const CACHE_TTL = 30 * 60 * 1000;

let cache: { data: { generatedAt: string; items: FriendPost[] } | null; timestamp: number } = {
	data: null,
	timestamp: 0,
};

function extractText(value: unknown): string {
	if (value == null) return "";
	if (typeof value === "string") return value;
	if (typeof value === "number") return String(value);
	if (typeof value === "object" && value !== null) {
		const obj = value as Record<string, unknown>;
		if ("#text" in obj && typeof obj["#text"] === "string") return obj["#text"];
		if ("_" in obj && typeof obj._ === "string") return obj._;
		if ("@_href" in obj && typeof obj["@_href"] === "string") return obj["@_href"];
	}
	return "";
}

function normalizeItems(value: unknown): Record<string, unknown>[] {
	if (Array.isArray(value)) return value as Record<string, unknown>[];
	if (value && typeof value === "object") return [value as Record<string, unknown>];
	return [];
}

function extractLink(value: unknown): string {
	if (Array.isArray(value)) {
		const alternate = value.find((item) => item?.["@_rel"] === "alternate") ?? value[0];
		return extractText(alternate);
	}
	return extractText(value);
}

function extractDate(item: Record<string, unknown>): string {
	const raw =
		extractText(item.pubDate) ||
		extractText(item.published) ||
		extractText(item.updated) ||
		extractText(item["dc:date"]) ||
		"";
	const timestamp = raw ? new Date(raw).getTime() : Number.NaN;
	return Number.isNaN(timestamp) ? "" : new Date(timestamp).toISOString();
}

function extractDescription(item: Record<string, unknown>): string {
	const raw =
		extractText(item.description) ||
		extractText(item.summary) ||
		extractText(item.content) ||
		extractText(item["content:encoded"]) ||
		"";
	return raw.replace(/<[^>]*>/g, "").trim().slice(0, 150);
}

function parseRSS(xml: string, friendName: string, avatar: string, siteurl: string): FriendPost[] {
	const parsed = parser.parse(xml);

	const rssItems = normalizeItems(parsed?.rss?.channel?.item);
	if (rssItems.length > 0) {
		return rssItems.slice(0, 3).map((item) => ({
			title: extractText(item.title),
			link: extractLink(item.link) || extractText(item.guid),
			published: extractDate(item),
			description: extractDescription(item),
			siteTitle: friendName,
			siteurl,
			avatar,
		}));
	}

	const atomEntries = normalizeItems(parsed?.feed?.entry);
	if (atomEntries.length > 0) {
		return atomEntries.slice(0, 3).map((entry) => ({
			title: extractText(entry.title),
			link: extractLink(entry.link) || extractText(entry.id),
			published: extractDate(entry),
			description: extractDescription(entry),
			siteTitle: friendName,
			siteurl,
			avatar,
		}));
	}

	return [];
}

async function findValidFeed(siteUrl: string): Promise<string | null> {
	for (const path of FEED_PATHS) {
		try {
			const feedUrl = new URL(path, siteUrl).href;
			const res = await fetch(feedUrl, {
				signal: AbortSignal.timeout(5000),
			});
			if (res.ok) {
				const text = await res.text();
				if (text.includes("<rss") || text.includes("<feed")) {
					return feedUrl;
				}
			}
		} catch {
			continue;
		}
	}
	return null;
}

async function fetchFriendPosts(): Promise<FriendPost[]> {
	const friends = await getCollection("friends");

	const results = await Promise.allSettled(
		friends.map(async (friend) => {
			const feedUrl = friend.data.rss ?? (await findValidFeed(friend.data.siteurl));
			if (!feedUrl) return [];

			const res = await fetch(feedUrl, {
				signal: AbortSignal.timeout(8000),
			});
			if (!res.ok) return [];
			const xml = await res.text();
			return parseRSS(xml, friend.data.title, friend.data.image, friend.data.siteurl);
		}),
	);

	const allPosts: FriendPost[] = [];
	for (const r of results) {
		if (r.status === "fulfilled") allPosts.push(...r.value);
	}

	allPosts.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
	return allPosts.filter((post) => post.title && post.link);
}

export const GET: APIRoute = async () => {
	try {
		const now = Date.now();
		if (cache.data && now - cache.timestamp < CACHE_TTL) {
			return new Response(JSON.stringify(cache.data), {
				status: 200,
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "public, max-age=0, must-revalidate",
				},
			});
		}

		const items = await fetchFriendPosts();
		const data = {
			generatedAt: new Date().toISOString(),
			items,
		};

		cache = { data, timestamp: now };

		return new Response(JSON.stringify(data), {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Cache-Control": "public, max-age=0, must-revalidate",
			},
		});
	} catch (e) {
		return new Response(
			JSON.stringify({
				generatedAt: new Date().toISOString(),
				items: [],
				error: "Failed to fetch friend posts",
			}),
			{
				status: 200,
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "public, max-age=0, must-revalidate",
				},
			},
		);
	}
};
