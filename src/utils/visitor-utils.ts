import { visitorConfig } from "@/config";

const STORAGE_KEY_PREFIX = "visitor_count_";
const SITE_VISITOR_KEY = "site_visitor";
const PAGE_VISITOR_KEY_PREFIX = "page_visitor_";

interface LeanCloudResponse {
	objectId: string;
	count: number;
	createdAt?: string;
	updatedAt?: string;
}

interface VisitorCountResult {
	success: boolean;
	count: number;
	error?: string;
}

function getStorageKey(key: string): string {
	return `${STORAGE_KEY_PREFIX}${key}`;
}

function getLocalCount(key: string): number {
	if (typeof window === "undefined") return 0;
	const stored = localStorage.getItem(getStorageKey(key));
	return stored ? Number.parseInt(stored, 10) : 0;
}

function setLocalCount(key: string, count: number): void {
	if (typeof window === "undefined") return;
	localStorage.setItem(getStorageKey(key), count.toString());
}

function incrementLocalCount(key: string): number {
	const current = getLocalCount(key);
	const newCount = current + 1;
	setLocalCount(key, newCount);
	return newCount;
}

async function getLeanCloudCount(key: string): Promise<number> {
	const { leancloud } = visitorConfig;
	if (!leancloud) return 0;

	const { appId, appKey, serverUrl } = leancloud;
	const baseUrl = serverUrl || "https://leancloud.cn";
	const className = "VisitorCount";

	try {
		const response = await fetch(
			`${baseUrl}/1.1/classes/${className}?where=${encodeURIComponent(JSON.stringify({ key }))}`,
			{
				headers: {
					"X-LC-Id": appId,
					"X-LC-Key": appKey,
					"Content-Type": "application/json",
				},
			},
		);

		if (!response.ok) return 0;

		const data = await response.json();
		if (data.results && data.results.length > 0) {
			return data.results[0].count || 0;
		}
		return 0;
	} catch {
		return 0;
	}
}

async function incrementLeanCloudCount(key: string): Promise<number> {
	const { leancloud } = visitorConfig;
	if (!leancloud) return 0;

	const { appId, appKey, serverUrl } = leancloud;
	const baseUrl = serverUrl || "https://leancloud.cn";
	const className = "VisitorCount";

	try {
		const existingResponse = await fetch(
			`${baseUrl}/1.1/classes/${className}?where=${encodeURIComponent(JSON.stringify({ key }))}`,
			{
				headers: {
					"X-LC-Id": appId,
					"X-LC-Key": appKey,
					"Content-Type": "application/json",
				},
			},
		);

		if (!existingResponse.ok) {
			return getLocalCount(key);
		}

		const existingData = await existingResponse.json();

		if (existingData.results && existingData.results.length > 0) {
			const record = existingData.results[0] as LeanCloudResponse;
			const newCount = (record.count || 0) + 1;

			await fetch(`${baseUrl}/1.1/classes/${className}/${record.objectId}`, {
				method: "PUT",
				headers: {
					"X-LC-Id": appId,
					"X-LC-Key": appKey,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ count: newCount }),
			});

			return newCount;
		}

		const createResponse = await fetch(`${baseUrl}/1.1/classes/${className}`, {
			method: "POST",
			headers: {
				"X-LC-Id": appId,
				"X-LC-Key": appKey,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ key, count: 1 }),
		});

		if (createResponse.ok) {
			return 1;
		}

		return getLocalCount(key);
	} catch {
		return getLocalCount(key);
	}
}

export async function getSiteVisitorCount(): Promise<VisitorCountResult> {
	if (!visitorConfig.enable) {
		return { success: false, count: 0, error: "Visitor tracking disabled" };
	}

	try {
		if (visitorConfig.provider === "leancloud") {
			const count = await getLeanCloudCount(SITE_VISITOR_KEY);
			return { success: true, count };
		} else if (visitorConfig.provider === "busuanzi") {
			// For busuanzi, we'll let the client-side script handle the count
			return { success: true, count: 0 };
		}

		const count = getLocalCount(SITE_VISITOR_KEY);
		return { success: true, count };
	} catch (error) {
		return { success: false, count: 0, error: String(error) };
	}
}

export async function incrementSiteVisitorCount(): Promise<VisitorCountResult> {
	if (!visitorConfig.enable) {
		return { success: false, count: 0, error: "Visitor tracking disabled" };
	}

	try {
		if (visitorConfig.provider === "leancloud") {
			const count = await incrementLeanCloudCount(SITE_VISITOR_KEY);
			return { success: true, count };
		} else if (visitorConfig.provider === "busuanzi") {
			// For busuanzi, the script automatically increments the count
			return { success: true, count: 0 };
		}

		const count = incrementLocalCount(SITE_VISITOR_KEY);
		return { success: true, count };
	} catch (error) {
		return { success: false, count: 0, error: String(error) };
	}
}

export async function getPageVisitorCount(
	pageSlug: string,
): Promise<VisitorCountResult> {
	if (!visitorConfig.enable) {
		return { success: false, count: 0, error: "Visitor tracking disabled" };
	}

	const key = `${PAGE_VISITOR_KEY_PREFIX}${pageSlug}`;

	try {
		if (visitorConfig.provider === "leancloud") {
			const count = await getLeanCloudCount(key);
			return { success: true, count };
		} else if (visitorConfig.provider === "busuanzi") {
			// For busuanzi, we'll let the client-side script handle the count
			return { success: true, count: 0 };
		}

		const count = getLocalCount(key);
		return { success: true, count };
	} catch (error) {
		return { success: false, count: 0, error: String(error) };
	}
}

export async function incrementPageVisitorCount(
	pageSlug: string,
): Promise<VisitorCountResult> {
	if (!visitorConfig.enable) {
		return { success: false, count: 0, error: "Visitor tracking disabled" };
	}

	const key = `${PAGE_VISITOR_KEY_PREFIX}${pageSlug}`;

	try {
		if (visitorConfig.provider === "leancloud") {
			const count = await incrementLeanCloudCount(key);
			return { success: true, count };
		} else if (visitorConfig.provider === "busuanzi") {
			// For busuanzi, the script automatically increments the count
			return { success: true, count: 0 };
		}

		const count = incrementLocalCount(key);
		return { success: true, count };
	} catch (error) {
		return { success: false, count: 0, error: String(error) };
	}
}

export function formatCount(count: number): string {
	if (count >= 1000000) {
		return `${(count / 1000000).toFixed(1)}M`;
	}
	if (count >= 1000) {
		return `${(count / 1000).toFixed(1)}K`;
	}
	return count.toLocaleString();
}

export function isVisitorTrackingEnabled(): boolean {
	return visitorConfig.enable;
}

export function getVisitorProvider(): string {
	return visitorConfig.provider;
}
