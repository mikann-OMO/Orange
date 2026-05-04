<script lang="ts">
import { walineConfig } from "@/config";
import { onMount } from "svelte";
import { Icon } from "astro-icon/components";

interface WalineComment {
	objectId: number;
	nick: string;
	mail?: string;
	link?: string;
	avatar: string;
	comment: string;
	url: string;
	time: number;
	status: string;
}

let comments: WalineComment[] = [];
let loading = true;
let error = "";

function getBlogUrl(path: string): string {
	if (path.startsWith('http')) return path;
	return (import.meta.env.PUBLIC_SITE_URL || 'https://mikann.fun') + path;
}

async function fetchRecentComments() {
	try {
		if (!walineConfig.enable || !walineConfig.serverURL) {
			throw new Error("Waline 未配置");
		}

		const response = await fetch(
			`${walineConfig.serverURL}/api/comment?type=recent&count=3`
		);

		if (!response.ok) throw new Error("Failed to fetch comments");

		const payload = await response.json();
		comments = Array.isArray(payload) ? payload : payload?.data || [];
		error = "";
	} catch (e) {
		error = "加载评论失败";
		console.error("Error fetching comments:", e);
	} finally {
		loading = false;
	}
}

function formatDate(timestamp: number) {
	const date = new Date(timestamp);
	return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' });
}

onMount(() => {
	if (walineConfig.enable && walineConfig.serverURL) {
		fetchRecentComments();
	} else {
		loading = false;
		error = "Waline 未配置";
	}
});
</script>

<div class="latest-comments">
	{#if loading}
		<div class="lc-status">加载中...</div>
	{:else if error}
		<div class="lc-status lc-error">{error}</div>
	{:else if comments.length === 0}
		<div class="lc-status">暂无</div>
	{:else}
		<div class="lc-list">
			{#each comments as comment}
				<a 
					href={getBlogUrl(comment.url)} 
					target="_blank" 
					rel="noopener noreferrer"
					class="lc-item group"
				>
					<div class="flex items-start gap-3">
						<img 
							src={comment.avatar}
							alt={comment.nick}
							class="lc-avatar"
							loading="lazy"
						/>
						<div class="flex-1 min-w-0">
							<div class="lc-meta">
								<span class="lc-nick">
									{#if comment.link}
										<a 
											href={comment.link.startsWith('http') ? comment.link : 'https://' + comment.link} 
											target="_blank" 
											rel="noopener noreferrer" 
											on:click|stopPropagation 
											class="lc-nick-link"
										>
											{comment.nick}
										</a>
									{:else}
										{comment.nick}
									{/if}
								</span>
								<span class="lc-time">
									<Icon name="material-symbols:schedule-outline-rounded" class="lc-time-icon" />
									{formatDate(comment.time)}
								</span>
							</div>
							<p class="lc-text">
								{@html comment.comment}
							</p>
						</div>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style>
	.latest-comments {
		font-family: inherit;
	}

	.lc-status {
		padding: 1rem 0;
		text-align: center;
		color: var(--text-secondary);
		font-size: 0.8125rem;
	}

	.lc-error {
		color: var(--error);
	}

	.lc-list {
		display: flex;
		flex-direction: column;
		gap: 0.625rem;
	}

	.lc-item {
		display: block;
		padding: 0.75rem;
		border-radius: 0.625rem;
		background: color-mix(in srgb, var(--primary) 4%, var(--card-bg));
		border: 1px solid transparent;
		transition: all 0.2s ease;
		text-decoration: none;
	}

	.lc-item:hover {
		background: color-mix(in srgb, var(--primary) 8%, var(--card-bg));
		border-color: color-mix(in srgb, var(--primary) 15%, var(--card-border));
		transform: translateY(-1px);
	}

	.lc-avatar {
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		border: 1.5px solid color-mix(in srgb, var(--primary) 30%, var(--card-border));
		flex-shrink: 0;
		transition: border-color 0.2s ease;
	}

	.lc-item:hover .lc-avatar {
		border-color: var(--primary);
	}

	.lc-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.25rem;
	}

	.lc-nick {
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.lc-nick-link {
		color: inherit;
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.lc-nick-link:hover {
		color: var(--primary);
	}

	.lc-time {
		font-size: 0.6875rem;
		color: color-mix(in srgb, var(--text-secondary) 60%, transparent);
		display: flex;
		align-items: center;
		gap: 0.25rem;
		flex-shrink: 0;
	}

	:global(.lc-time-icon) {
		width: 0.75rem;
		height: 0.75rem;
	}

	.lc-text {
		font-size: 0.75rem;
		color: var(--text-secondary);
		line-height: 1.6;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		margin: 0;
	}
</style>
