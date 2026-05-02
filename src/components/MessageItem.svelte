<script lang="ts">
import type { Message } from "@/types/message";
import { createEventDispatcher } from "svelte";
import { tick } from "svelte";
import MessageEditor from "./MessageEditor.svelte";

export let message: Message;
export let slug: string;
const dispatch = createEventDispatcher<{
	reply: never;
}>();

let showReply = false;

async function toggleReply() {
	showReply = !showReply;
	try {
		await tick();
	} catch (e) {
		console.warn("Reply toggle aborted:", e);
	}
}

async function handleReplyAdded() {
	try {
		await tick();
		dispatch("reply");
	} catch (e) {
		console.warn("Reply added event aborted:", e);
	}
}
</script>

<div class="message-item border rounded-lg p-4">
	<div class="flex items-start gap-4">
		<div class="flex-shrink-0">
		<img
			src={message.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(message.nickname)}&background=random`}
			alt={message.nickname}
			class="w-12 h-12 rounded-full object-cover"
		/>
	</div>
		<div class="flex-1">
			<div class="flex items-center justify-between mb-2">
				<h4 class="font-semibold">{message.nickname}</h4>
				<span class="text-xs text-[var(--text-secondary)]">{new Date(message.createdAt).toLocaleString()}</span>
			</div>
			<div class="message-content mb-3">{@html message.content}</div>
			<div class="flex items-center gap-2">
				<button
					on:click={toggleReply}
					class="text-sm text-[var(--accent-text)] hover:underline"
				>
					{showReply ? "取消" : "回复"}
				</button>
			</div>
			{#if showReply}
				<div class="mt-4 pt-4 border-t">
					<MessageEditor
						slug={slug}
						parentId={message.id}
						isReply={true}
						on:added={handleReplyAdded}
					/>
				</div>
			{/if}
		</div>
	</div>
</div>
