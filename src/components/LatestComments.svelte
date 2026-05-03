<script lang="ts">
import type { Message } from "@/types/message";
import { onMount } from "svelte";
import { Icon } from "astro-icon/components";

let messages: Message[] = [];
let loading = true;
let error = "";
let apiBase = "";

async function fetchAllMessages() {
	try {
		const base = apiBase ? apiBase.replace(/\/$/, "") : "";
		const response = await fetch(
			`${base}/api/messages`,
		);
		if (!response.ok) throw new Error("Failed to fetch messages");
		const allMessages = await response.json();
		messages = flattenMessages(allMessages)
			.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
			.slice(0, 3);
		error = "";
	} catch (e) {
		error = "加载评论失败";
		console.error("Error fetching messages:", e);
	} finally {
		loading = false;
	}
}

function flattenMessages(messages: Message[]): Message[] {
	const result: Message[] = [];
	for (const msg of messages) {
		result.push(msg);
		if (msg.replies && msg.replies.length > 0) {
			result.push(...flattenMessages(msg.replies));
		}
	}
	return result;
}

function formatDate(dateStr: string) {
	const date = new Date(dateStr);
	return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' });
}

onMount(() => {
	const carrier = document.getElementById("config-carrier");
	apiBase = carrier?.getAttribute("data-message-api-base") || "";
	const timer = setTimeout(() => {
		fetchAllMessages();
	}, 100);
	return () => clearTimeout(timer);
});
</script>

<div class="latest-comments">
	{#if loading}
		<div class="py-4 text-center text-orange-950/50 dark:text-white/50">加载中...</div>
	{:else if error}
		<div class="py-4 text-center text-red-500">{error}</div>
	{:else if messages.length === 0}
		<div class="py-4 text-center text-orange-950/50 dark:text-white/50">暂无</div>
	{:else}
		<div class="space-y-3">
			{#each messages as message}
				<div class="group p-3 rounded-lg bg-orange-50/50 dark:bg-stone-700/30 hover:bg-orange-100/80 dark:hover:bg-stone-700/50 transition-all duration-200">
					<div class="flex items-start gap-3">
						<img 
							src={message.avatar}
							alt={message.nickname}
							class="w-8 h-8 rounded-full flex-shrink-0"
							loading="lazy"
						/>
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2 mb-1">
								<span class="text-sm font-bold text-orange-700 dark:text-white">
									{#if message.website}
										<a href={message.website} target="_blank" rel="noopener noreferrer" class="hover:text-orange-600 dark:hover:text-orange-300 transition-colors">
											{message.nickname}
										</a>
									{:else}
										{message.nickname}
									{/if}
								</span>
								<span class="text-xs text-orange-950/40 dark:text-white/40 flex items-center gap-1">
									<span class="material-icons text-xs"
										><Icon name="material-symbols:schedule-outline-rounded" class="w-3 h-3"
									/></span>
									{formatDate(message.createdAt)}
								</span>
							</div>
							<p class="text-xs text-orange-950/70 dark:text-white/70 line-clamp-2">
								{@html message.content}
							</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
