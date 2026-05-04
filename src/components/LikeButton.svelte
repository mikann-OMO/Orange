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
		padding: 0.25rem 0.55rem;
		border-radius: 999px;
		border: 1px solid rgba(255, 152, 0, 0.25);
		background: rgba(255, 255, 255, 0.35);
		color: inherit;
		transition: transform 150ms ease, background 150ms ease, border-color 150ms ease;
		user-select: none;
	}
	:global(.dark) .like-btn {
		background: rgba(51, 41, 34, 0.25);
		border-color: rgba(255, 255, 255, 0.08);
	}
	.like-btn:hover {
		background: rgba(255, 255, 255, 0.55);
		border-color: rgba(255, 152, 0, 0.4);
	}
	.like-btn:active {
		transform: scale(0.98);
	}
	.like-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.heart {
		font-size: 0.95rem;
		line-height: 1;
		transform: translateY(-0.5px);
		transition: transform 150ms ease, color 150ms ease, opacity 150ms ease;
		opacity: 0.9;
	}
	.heart.on {
		color: rgb(234 88 12);
		transform: translateY(-0.5px) scale(1.05);
		opacity: 1;
	}
	.heart.off {
		color: rgba(234, 88, 12, 0.55);
	}
	.count {
		font-size: 0.875rem;
		font-weight: 600;
	}
	.like-error {
		margin-left: 0.5rem;
		font-size: 0.75rem;
		opacity: 0.7;
	}
</style>
