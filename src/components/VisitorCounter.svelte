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


let count = $state(0);
let loading = $state(true);

let displayCount = $derived(formatCount(count));

const TRACK_INTERVAL_KEY = "site_visitor_tracked_at";
const SITE_VISITOR_KEY = "site_visitor_count";
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

$effect(() => {
	if (!isVisitorTrackingEnabled()) {
		loading = false;
		return;
	}

	async function init() {
		try {
			count = getLocalCount(SITE_VISITOR_KEY);
			loading = false;

			if (shouldTrack()) {
				const result = await incrementSiteVisitorCount();
				if (result.success) {
					count = result.count;
					localStorage.setItem(SITE_VISITOR_KEY, count.toString());
					markTracked();
				} else {
					count = incrementLocalCount(SITE_VISITOR_KEY);
					markTracked();
				}
			}
		} catch (e) {
			console.error("Visitor count error:", e);
			if (count === 0) {
				count = getLocalCount(SITE_VISITOR_KEY);
			}
			loading = false;
		}
	}
	init();
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
