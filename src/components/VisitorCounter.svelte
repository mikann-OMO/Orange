<script lang="ts">
import {
	isVisitorTrackingEnabled,
} from "@utils/visitor-utils";
import {
	formatCount,
	getSiteVisitorCount,
	incrementSiteVisitorCount,
	getLocalCount,
	incrementLocalCount,
} from "@utils/visitor-utils";
import { onMount } from "svelte";

let count = $state(0);
let loading = $state(true);
let error = $state(false);

let displayCount = $derived(formatCount(count));

const TRACK_INTERVAL_KEY = "visitor_track_interval";
const SITE_VISITOR_KEY = "site_visitor";
const TRACK_INTERVAL_MS = 24 * 60 * 60 * 1000;

function shouldTrack(): boolean {
	if (typeof window === "undefined") return false;

	const lastTrack = localStorage.getItem(TRACK_INTERVAL_KEY);
	if (!lastTrack) return true;

	const lastTrackTime = Number.parseInt(lastTrack, 10);
	return Date.now() - lastTrackTime > TRACK_INTERVAL_MS;
}

function markTracked(): void {
	if (typeof window === "undefined") return;
	localStorage.setItem(TRACK_INTERVAL_KEY, Date.now().toString());
}

onMount(async () => {
	if (!isVisitorTrackingEnabled()) {
		loading = false;
		return;
	}

	try {
		// 首先尝试使用 localStorage 中的本地值
		count = getLocalCount(SITE_VISITOR_KEY);
		
		if (shouldTrack()) {
			const result = await incrementSiteVisitorCount();
			if (result.success) {
				count = result.count;
				markTracked();
			} else {
				// 如果 API 失败，增加本地计数
				count = incrementLocalCount(SITE_VISITOR_KEY);
				markTracked();
			}
		} else {
			const result = await getSiteVisitorCount();
			if (result.success) {
				count = result.count;
			}
		}
	} catch (e) {
		console.error("Visitor count error:", e);
		// 如果出错，确保至少显示本地计数
		if (count === 0) {
			count = getLocalCount(SITE_VISITOR_KEY);
		}
		error = true;
	} finally {
		loading = false;
	}
});
</script>

<div class="visitor-counter">
	{#if loading}
		<span class="count loading">---</span>
	{:else}
		<span class="count">{displayCount}</span>
	{/if}
</div>

<style>
	.visitor-counter {
		display: inline-flex;
		align-items: center;
	}

	.count {
		font-weight: bold;
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
