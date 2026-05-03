<script lang="ts">
import {
	formatCount,
	getPageVisitorCount,
	getVisitorProvider,
	incrementPageVisitorCount,
	isVisitorTrackingEnabled,
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
const TRACK_INTERVAL_MS = 5 * 60 * 1000;

function getTrackKey(): string {
	return `${TRACK_INTERVAL_KEY_PREFIX}${slug}`;
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
		if (shouldTrack()) {
			const result = await incrementPageVisitorCount(slug);
			if (result.success) {
				count = result.count;
				markTracked();
			} else {
				error = true;
				const getResult = await getPageVisitorCount(slug);
				if (getResult.success) {
					count = getResult.count;
				}
			}
		} else {
			const result = await getPageVisitorCount(slug);
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
</script>

<div class="page-visitor-counter">
	{#if loading}
		<span class="count loading">---</span>
	{:else if error}
		<span class="count error">N/A</span>
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
