import { visitorConfig } from "@/config";

interface VisitorResult {
	count: number;
	success: boolean;
}

function getConfig() {
	if (typeof window === "undefined") return { enabled: false, provider: "local" as const };
	const carrier = document.getElementById("config-carrier");
	if (carrier) {
		const enabled = carrier.getAttribute("data-visitor-enable") === "1";
		const provider = (carrier.getAttribute("data-visitor-provider") || "local") as "leancloud" | "server" | "local";
		return { enabled, provider };
	}
	return { enabled: visitorConfig.enable, provider: visitorConfig.provider };
}

export function isVisitorTrackingEnabled(): boolean {
	return getConfig().enabled;
}

export function getVisitorProvider() {
	return getConfig().provider;
}

export function getLocalCount(key: string): number {
	try {
		return Number.parseInt(localStorage.getItem(key) || "0", 10);
	} catch {
		return 0;
	}
}

export function incrementLocalCount(key: string): number {
	const count = getLocalCount(key) + 1;
	try {
		localStorage.setItem(key, count.toString());
	} catch {
		// ignore
	}
	return count;
}

function fallbackError(): VisitorResult {
	return { count: 0, success: false };
}

async function fetchCount(key: string): Promise<VisitorResult> {
	const { provider } = getConfig();
	if (provider === "local") {
		return { count: getLocalCount(key), success: true };
	}
	try {
		const res = await fetch(`/api/visitor?key=${encodeURIComponent(key)}&op=get`);
		if (!res.ok) throw new Error("Failed to get visitor count");
		const data = (await res.json()) as { count?: number };
		return { count: data.count || 0, success: true };
	} catch {
		return fallbackError();
	}
}

async function fetchIncrement(key: string): Promise<VisitorResult> {
	const { provider } = getConfig();
	if (provider === "local") {
		return { count: incrementLocalCount(key), success: true };
	}
	try {
		const res = await fetch(`/api/visitor?key=${encodeURIComponent(key)}&op=inc`, {
			method: "POST",
		});
		if (!res.ok) throw new Error("Failed to increment visitor count");
		const data = (await res.json()) as { count?: number };
		return { count: data.count || 0, success: true };
	} catch {
		return fallbackError();
	}
}

export async function getSiteVisitorCount(): Promise<VisitorResult> {
	return fetchCount("site_visitor");
}

export async function incrementSiteVisitorCount(): Promise<VisitorResult> {
	return fetchIncrement("site_visitor");
}

export async function getPageVisitorCount(page: string): Promise<VisitorResult> {
	return fetchCount(`page_${page}`);
}

export async function incrementPageVisitorCount(page: string): Promise<VisitorResult> {
	return fetchIncrement(`page_${page}`);
}

export function formatCount(count: number): string {
	if (count < 10000) {
		return count.toLocaleString();
	}
	if (count < 100000000) {
		return `${(count / 10000).toFixed(2)}万`;
	}
	return `${(count / 100000000).toFixed(2)}亿`;
}
