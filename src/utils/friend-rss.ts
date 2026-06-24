import { getCollection } from "astro:content";
import { XMLParser } from "fast-xml-parser";

export type FriendPost = {
	title: string;
	url: string;
	date: string;
	friendlyName: string;
	friendlyAvatar: string;
};

const parser = new XMLParser({
	ignoreAttributes: false,
	attributeNamePrefix: "@_",
	processEntities: false,
});

const FEED_PATHS = ["/feed.xml", "/rss.xml", "/atom.xml", "/feed", "/rss", "/feed/", "/atom/", "/index.xml"];

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

function parseRSS(xml: string, friendName: string, avatar: string): FriendPost[] {
	const parsed = parser.parse(xml);

	const rssItems = normalizeItems(parsed?.rss?.channel?.item);
	if (rssItems.length > 0) {
		return rssItems.slice(0, 3).map((item) => ({
			title: extractText(item.title),
			url: extractText(item.link),
			date: extractDate(item),
			friendlyName: friendName,
			friendlyAvatar: avatar,
		}));
	}

	const atomEntries = normalizeItems(parsed?.feed?.entry);
	if (atomEntries.length > 0) {
		return atomEntries.slice(0, 3).map((entry) => ({
			title: extractText(entry.title),
			url: extractText(entry.link),
			date: extractDate(entry),
			friendlyName: friendName,
			friendlyAvatar: avatar,
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

export async function getFriendLatestPosts(limit = 3): Promise<FriendPost[]> {
	const friends = await getCollection("friends");

	const results = await Promise.allSettled(
		friends.map(async (friend) => {
			const feedUrl = friend.data.rss ?? (await findValidFeed(friend.data.siteurl));
			if (!feedUrl) return [];

			const res = await fetch(feedUrl, {
				signal: AbortSignal.timeout(5000),
			});
			if (!res.ok) return [];
			const xml = await res.text();
			return parseRSS(xml, friend.data.title, friend.data.image);
		}),
	);

	const allPosts: FriendPost[] = [];
	for (const r of results) {
		if (r.status === "fulfilled") allPosts.push(...r.value);
	}

	allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
	return allPosts.slice(0, limit);
}
