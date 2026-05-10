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

let displayCount = $derived(formatCount(count));

const TRACK_INTERVAL_KEY_PREFIX = "page_tracked_at_";
const PAGE_VISITOR_KEY_PREFIX = "page_count_";
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
		// 首先显示 localStorage 中的缓存值
		count = getLocalCount(getPageKey());
		loading = false;

		// 只在需要追踪时才调用 API（5分钟一次）
		if (shouldTrack()) {
			const result = await incrementPageVisitorCount(slug);
			if (result.success) {
				count = result.count;
				localStorage.setItem(getPageKey(), count.toString());
				markTracked();
			} else {
				// API 失败，使用本地计数
				count = incrementLocalCount(getPageKey());
				markTracked();
			}
		}
		// 如果不需要追踪，直接使用 localStorage 缓存值，不调用 API
	} catch (e) {
		console.error("Page view count error:", e);
		if (count === 0) {
			count = getLocalCount(getPageKey());
		}
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
