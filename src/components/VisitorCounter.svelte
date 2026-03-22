<script lang="ts">
import {
	getVisitorProvider,
	isVisitorTrackingEnabled,
} from "@utils/visitor-utils";
import {
	formatCount,
	getSiteVisitorCount,
	incrementSiteVisitorCount,
} from "@utils/visitor-utils";
import { onMount } from "svelte";

declare global {
	interface Window {
		busuanzi?: {
			fetch: () => void;
		};
	}
}

let count = 0;
let loading = true;
let error = false;
let useBusuanzi = false;

const TRACK_INTERVAL_KEY = "visitor_track_interval";
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

function loadBusuanzi(): void {
	if (typeof window === "undefined") return;

	const existingScript = document.querySelector('script[src*="busuanzi"]');
	if (existingScript) {
		if (window.busuanzi) {
			window.busuanzi.fetch();
		}
		return;
	}

	const script = document.createElement("script");
	script.src = "//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js";
	script.async = true;
	document.body.appendChild(script);
}

onMount(async () => {
	if (!isVisitorTrackingEnabled()) {
		loading = false;
		return;
	}

	const provider = getVisitorProvider();
	useBusuanzi = provider === "busuanzi";

	if (useBusuanzi) {
		loadBusuanzi();
		loading = false;
		return;
	}

	try {
		if (shouldTrack()) {
			const result = await incrementSiteVisitorCount();
			if (result.success) {
				count = result.count;
				markTracked();
			} else {
				error = true;
				const getResult = await getSiteVisitorCount();
				if (getResult.success) {
					count = getResult.count;
				}
			}
		} else {
			const result = await getSiteVisitorCount();
			if (result.success) {
				count = result.count;
			} else {
				error = true;
			}
		}
	} catch {
		error = true;
	} finally {
		loading = false;
	}
});

$: displayCount = formatCount(count);
</script>

<div class="visitor-counter">
	{#if useBusuanzi}
		<span id="busuanzi_value_site_pv" class="count">---</span>
	{:else if loading}
		<span class="count loading">---</span>
	{:else if error}
		<span class="count error">N/A</span>
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

	.count.error {
		opacity: 0.5;
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
