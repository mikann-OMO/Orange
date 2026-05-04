<script lang="ts">
import { onMount } from "svelte";

interface Props {
	slug: string;
}

let { slug }: Props = $props();

let count = $state(0);
let liked = $state(false);
let loading = $state(true);
let error = $state("");

const LIKE_KEY_PREFIX = "liked_v1_";

function storageKey(): string {
	return `${LIKE_KEY_PREFIX}${slug}`;
}

function readLiked(): boolean {
	try {
		return localStorage.getItem(storageKey()) === "1";
	} catch {
		return false;
	}
}

function writeLiked(value: boolean): void {
	try {
		localStorage.setItem(storageKey(), value ? "1" : "0");
	} catch {
		// ignore
	}
}

async function refreshCount(): Promise<void> {
	const res = await fetch(`/api/likes?slug=${encodeURIComponent(slug)}`);
	if (!res.ok) throw new Error("Failed");
	const data = (await res.json()) as { count?: number };
	count = typeof data.count === "number" ? data.count : 0;
}

async function toggleLike(): Promise<void> {
	if (loading) return;
	const nextLiked = !liked;
	liked = nextLiked;
	writeLiked(nextLiked);

	try {
		const res = await fetch("/api/likes", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ slug, delta: nextLiked ? 1 : -1 }),
		});
		if (!res.ok) throw new Error("Failed");
		const data = (await res.json()) as { count?: number };
		count = typeof data.count === "number" ? data.count : count;
		error = "";
	} catch {
		liked = !nextLiked;
		writeLiked(liked);
		error = "点赞失败";
	}
}

onMount(async () => {
	liked = readLiked();
	try {
		await refreshCount();
	} catch {
		error = "加载失败";
	} finally {
		loading = false;
	}
});
</script>

<button
	type="button"
	class="like-btn"
	aria-pressed={liked}
	onclick={toggleLike}
	disabled={loading}
	title={liked ? "取消点赞" : "点赞"}
>
	<span class="heart {liked ? 'on' : 'off'}" aria-hidden="true">&#9829;</span>
	<span class="count">{loading ? "---" : count}</span>
</button>
{#if error}
	<span class="like-error" aria-live="polite">{error}</span>
{/if}

<style>
	.like-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.3125rem 0.625rem;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--primary) 20%, var(--card-border));
		background: color-mix(in srgb, var(--primary) 5%, var(--card-bg));
		color: inherit;
		transition: all 0.2s ease;
		user-select: none;
		cursor: pointer;
	}
	.like-btn:hover {
		background: color-mix(in srgb, var(--primary) 10%, var(--card-bg));
		border-color: color-mix(in srgb, var(--primary) 35%, var(--card-border));
	}
	.like-btn:active {
		transform: scale(0.96);
	}
	.like-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.heart {
		font-size: 0.95rem;
		line-height: 1;
		transform: translateY(-0.5px);
		transition: transform 0.2s ease, color 0.2s ease, opacity 0.2s ease;
		opacity: 0.8;
	}
	.heart.on {
		color: var(--primary);
		transform: translateY(-0.5px) scale(1.1);
		opacity: 1;
		animation: heartPop 0.35s ease-out;
	}
	@keyframes heartPop {
		0% { transform: translateY(-0.5px) scale(1); }
		40% { transform: translateY(-0.5px) scale(1.3); }
		100% { transform: translateY(-0.5px) scale(1.1); }
	}
	.heart.off {
		color: color-mix(in srgb, var(--primary) 45%, var(--text-secondary));
	}
	.count {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--text-primary);
		min-width: 1.25rem;
		text-align: center;
	}
	.like-error {
		margin-left: 0.5rem;
		font-size: 0.6875rem;
		color: var(--error);
		opacity: 0.8;
	}
</style>
