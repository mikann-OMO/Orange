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
		<div class="py-4 text-center text-orange-950/50 dark:text-white/50">加载中...</div>
	{:else if error}
		<div class="py-4 text-center text-red-500">{error}</div>
	{:else if comments.length === 0}
		<div class="py-4 text-center text-orange-950/50 dark:text-white/50">暂无</div>
	{:else}
		<div class="space-y-3">
			{#each comments as comment}
				<a 
					href={getBlogUrl(comment.url)} 
					target="_blank" 
					rel="noopener noreferrer"
					class="group block p-3 rounded-lg bg-orange-50/50 dark:bg-stone-700/30 hover:bg-orange-100/80 dark:hover:bg-stone-700/50 transition-all duration-200"
				>
					<div class="flex items-start gap-3">
						<img 
							src={comment.avatar}
							alt={comment.nick}
							class="w-8 h-8 rounded-full flex-shrink-0"
							loading="lazy"
						/>
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 mb-1">
								<span class="text-sm font-bold text-orange-700 dark:text-white">
									{#if comment.link}
										<a 
											href={comment.link.startsWith('http') ? comment.link : 'https://' + comment.link} 
											target="_blank" 
											rel="noopener noreferrer" 
											on:click|stopPropagation 
											class="hover:text-orange-600 dark:hover:text-orange-300 transition-colors"
										>
											{comment.nick}
										</a>
									{:else}
										{comment.nick}
									{/if}
								</span>
								<span class="text-xs text-orange-950/40 dark:text-white/40 flex items-center gap-1">
									<Icon name="material-symbols:schedule-outline-rounded" class="w-3 h-3" />
									{formatDate(comment.time)}
								</span>
							</div>
							<p class="text-xs text-orange-950/70 dark:text-white/70 line-clamp-2">
								{@html comment.comment}
							</p>
						</div>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>
