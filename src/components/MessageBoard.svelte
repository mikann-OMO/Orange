<script lang="ts">
import type { Message } from "@/types/message";
import { onMount } from "svelte";
import MessageEditor from "./MessageEditor.svelte";
import MessageItem from "./MessageItem.svelte";

export let slug: string;

let messages: Message[] = [];
let loading = true;
let error = "";

async function fetchMessages() {
	try {
		const response = await fetch(
			`/api/messages?slug=${encodeURIComponent(slug)}`,
		);
		if (!response.ok) throw new Error("Failed to fetch messages");
		messages = await response.json();
		error = "";
	} catch (e) {
		error = "加载留言失败";
		console.error("Error fetching messages:", e);
	} finally {
		loading = false;
	}
}

function handleMessageAdded() {
	fetchMessages();
}

onMount(() => {
	const timer = setTimeout(() => {
		fetchMessages();
	}, 100);
	return () => clearTimeout(timer);
});
</script>

<div class="message-board">
	<h3 class="text-xl font-bold mb-4">留言板</h3>

	<MessageEditor {slug} parentId={null} on:added={handleMessageAdded} />

	{#if loading}
		<div class="py-8 text-center text-gray-500">加载中...</div>
	{:else if error}
		<div class="py-8 text-center text-red-500">{error}</div>
	{:else if messages.length === 0}
		<div class="py-8 text-center text-gray-500">还没有留言，快来抢沙发吧！</div>
	{:else}
		<div class="message-list space-y-6 mt-6">
			{#each messages as message (message.id)}
				<MessageItem {message} {slug} on:reply={handleMessageAdded} />
			{/each}
		</div>
	{/if}
</div>
