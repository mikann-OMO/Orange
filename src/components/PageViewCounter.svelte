<script lang="ts">
import {
	formatCount,
	getPageVisitorCount,
	incrementPageVisitorCount,
	isVisitorTrackingEnabled,
	getLocalCount,
	incrementLocalCount,
} from "@utils/visitor-utils";
import { onMount } from "svelte";

interface Props {
	slug: string;
}

let { slug }: Props = $props();

let count = $state(0);
let loading = $state(true);
let error = $state(false);

let displayCount = $derived(formatCount(count));

const TRACK_INTERVAL_KEY_PREFIX = "page_track_interval_";
const PAGE_VISITOR_KEY_PREFIX = "page_visitor_";
const TRACK_INTERVAL_MS = 5 * 60 * 1000;

function getTrackKey(): string {
	return `${TRACK_INTERVAL_KEY_PREFIX}${slug}`;
}

function getPageKey(): string {
	return `${PAGE_VISITOR_KEY_PREFIX}${slug}`;
}

function shouldTrack(): boolean {
	if (typeof window === "undefined") return false;

	const lastTrack = localStorage.getItem(getTrackKey());
	if (!lastTrack) return true;

	const lastTrackTime = Number.parseInt(lastTrack, 10);
	return Date.now() - lastTrackTime > TRACK_INTERVAL_MS;
}

function markTracked(): void {
	if (typeof window === "undefined") return;
	localStorage.setItem(getTrackKey(), Date.now().toString());
}

onMount(async () => {
	if (!isVisitorTrackingEnabled() || !slug) {
		loading = false;
		return;
	}

	try {
		// 首先尝试使用 localStorage 中的本地值
		count = getLocalCount(getPageKey());
		
		if (shouldTrack()) {
			const result = await incrementPageVisitorCount(slug);
			if (result.success) {
				count = result.count;
				markTracked();
			} else {
				// 如果 API 失败，增加本地计数
				count = incrementLocalCount(getPageKey());
				markTracked();
			}
		} else {
			const result = await getPageVisitorCount(slug);
			if (result.success) {
				count = result.count;
			}
		}
	} catch (e) {
		console.error("Page view count error:", e);
		// 如果出错，确保至少显示本地计数
		if (count === 0) {
			count = getLocalCount(getPageKey());
		}
		error = true;
	} finally {
		loading = false;
	}
});
</script>

<div class="page-visitor-counter">
	{#if loading}
		<span class="count loading">---</span>
	{:else}
		<span class="count">{displayCount}</span>
	{/if}
</div>

<style>
	.page-visitor-counter {
		display: inline-flex;
		align-items: center;
	}

	.count {
		font-weight: 500;
		color: inherit;
	}

	.count.loading {
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.4;
		}
		50% {
			opacity: 1;
		}
	}
</style>
