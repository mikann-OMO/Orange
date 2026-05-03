const STORAGE_KEY_PREFIX = "visitor_count_";
const SITE_VISITOR_KEY = "site_visitor";
const PAGE_VISITOR_KEY_PREFIX = "page_visitor_";

type VisitorProvider = "leancloud" | "local" | "server";

interface VisitorCountResult {
	success: boolean;
	count: number;
	error?: string;
}

function getCarrier(): HTMLElement | null {
	if (typeof document === "undefined") return null;
	return document.getElementById("config-carrier");
}

function parseBool(input: string | undefined | null): boolean {
	if (!input) return false;
	const v = input.trim().toLowerCase();
	return v === "1" || v === "true" || v === "yes" || v === "on";
}

function getRuntimeVisitorConfig(): {
	enable: boolean;
	provider: VisitorProvider;
} {
	const carrier = getCarrier();
	
	// 如果没有 carrier，默认启用并使用 server 或 local
	if (!carrier) {
		return { enable: true, provider: "local" };
	}
	
	const enable = parseBool(carrier?.getAttribute("data-visitor-enable"));
	const providerRaw = (
		carrier?.getAttribute("data-visitor-provider") || ""
	).trim();
	const provider = (
		providerRaw === "server" || providerRaw === "local" || providerRaw === "leancloud"
			? providerRaw
			: "local"
	) as VisitorProvider;

	return { enable: enable !== undefined ? enable : true, provider };
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
	try {
		const response = await fetch(
			`/api/visitor?key=${encodeURIComponent(key)}&op=get`,
		);
		if (!response.ok) return 0;
		const data = (await response.json()) as { count?: number };
		return typeof data.count === "number" ? data.count : 0;
	} catch {
		return 0;
	}
}

async function incrementLeanCloudCount(key: string): Promise<number> {
	try {
		const response = await fetch(
			`/api/visitor?key=${encodeURIComponent(key)}&op=inc`,
			{
				method: "POST",
			},
		);
		if (!response.ok) return getLocalCount(key);
		const data = (await response.json()) as { count?: number };
		return typeof data.count === "number" ? data.count : getLocalCount(key);
	} catch {
		return getLocalCount(key);
	}
}

export async function getSiteVisitorCount(): Promise<VisitorCountResult> {
	const cfg = getRuntimeVisitorConfig();
	if (!cfg.enable) {
		return { success: false, count: 0, error: "Visitor tracking disabled" };
	}

	try {
		if (cfg.provider === "leancloud") {
			const count = await getLeanCloudCount(SITE_VISITOR_KEY);
			return { success: true, count };
		}
		if (cfg.provider === "server") {
			const response = await fetch(
				`/api/visitor?key=${encodeURIComponent(SITE_VISITOR_KEY)}&op=get`,
			);
			if (!response.ok) return { success: false, count: 0 };
			const data = (await response.json()) as { count?: number };
			return {
				success: true,
				count: typeof data.count === "number" ? data.count : 0,
			};
		}

		const count = getLocalCount(SITE_VISITOR_KEY);
		return { success: true, count };
	} catch (error) {
		return { success: false, count: 0, error: String(error) };
	}
}

export async function incrementSiteVisitorCount(): Promise<VisitorCountResult> {
	const cfg = getRuntimeVisitorConfig();
	if (!cfg.enable) {
		return { success: false, count: 0, error: "Visitor tracking disabled" };
	}

	try {
		if (cfg.provider === "leancloud") {
			const count = await incrementLeanCloudCount(SITE_VISITOR_KEY);
			return { success: true, count };
		}
		if (cfg.provider === "server") {
			const response = await fetch(
				`/api/visitor?key=${encodeURIComponent(SITE_VISITOR_KEY)}&op=inc`,
				{ method: "POST" },
			);
			if (!response.ok) return { success: false, count: 0 };
			const data = (await response.json()) as { count?: number };
			return {
				success: true,
				count: typeof data.count === "number" ? data.count : 0,
			};
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
	const cfg = getRuntimeVisitorConfig();
	if (!cfg.enable) {
		return { success: false, count: 0, error: "Visitor tracking disabled" };
	}

	const key = `${PAGE_VISITOR_KEY_PREFIX}${pageSlug}`;

	try {
		if (cfg.provider === "leancloud") {
			const count = await getLeanCloudCount(key);
			return { success: true, count };
		}
		if (cfg.provider === "server") {
			const response = await fetch(
				`/api/visitor?key=${encodeURIComponent(key)}&op=get`,
			);
			if (!response.ok) return { success: false, count: 0 };
			const data = (await response.json()) as { count?: number };
			return {
				success: true,
				count: typeof data.count === "number" ? data.count : 0,
			};
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
	const cfg = getRuntimeVisitorConfig();
	if (!cfg.enable) {
		return { success: false, count: 0, error: "Visitor tracking disabled" };
	}

	const key = `${PAGE_VISITOR_KEY_PREFIX}${pageSlug}`;

	try {
		if (cfg.provider === "leancloud") {
			const count = await incrementLeanCloudCount(key);
			return { success: true, count };
		}
		if (cfg.provider === "server") {
			const response = await fetch(
				`/api/visitor?key=${encodeURIComponent(key)}&op=inc`,
				{ method: "POST" },
			);
			if (!response.ok) return { success: false, count: 0 };
			const data = (await response.json()) as { count?: number };
			return {
				success: true,
				count: typeof data.count === "number" ? data.count : 0,
			};
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
	return getRuntimeVisitorConfig().enable;
}

export function getVisitorProvider(): string {
	return getRuntimeVisitorConfig().provider;
}

export { getLocalCount, incrementLocalCount };
