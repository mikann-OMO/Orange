<script>
import Icon from "@iconify/svelte";
import MessageEditor from "./MessageEditor.svelte";
import MessageItem from "./MessageItem.svelte";

/** @type {{ slug?: string }} */
let { slug = "message-board" } = $props();

let messages = $state([]);
let loading = $state(true);
let showSuccess = $state(false);

async function fetchMessages() {
	loading = true;
	try {
		const res = await fetch(`/api/messages/?slug=${slug}`);
		if (res.ok) {
			const rawMessages = await res.json();

			const messageMap = new Map();
			rawMessages.forEach((m) => {
				m.replies = [];
				messageMap.set(m.id, m);
			});

			const rootMessages = [];
			rawMessages.forEach((m) => {
				if (m.parentId && messageMap.has(m.parentId)) {
					messageMap.get(m.parentId).replies.push(m);
				} else {
					rootMessages.push(m);
				}
			});

			rootMessages.sort((a, b) => b.createdAt - a.createdAt);

			rawMessages.forEach((m) => {
				if (m.replies) {
					m.replies.sort((a, b) => a.createdAt - b.createdAt);
				}
			});

			messages = rootMessages;
		}
	} catch (e) {
		console.error("Failed to fetch messages", e);
	} finally {
		loading = false;
	}
}

function handleSuccess(e) {
	showSuccess = true;
	setTimeout(() => {
		showSuccess = false;
	}, 3000);

	fetchMessages();
}

$effect(() => {
	const timer = setTimeout(() => {
		fetchMessages();
	}, 100);
	return () => clearTimeout(timer);
});
</script>

<div class="flex flex-col gap-6">
	{#if showSuccess}
		<div class="fixed top-20 right-4 z-50 bg-[var(--success)] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce-in text-sm font-medium">
			<Icon icon="fa6-solid:check" class="text-lg" />
			<span>发送成功！</span>
		</div>
	{/if}

	<div class="message-form-card card-base !overflow-visible p-5 sm:p-6 border-0 shadow-sm" style="background: linear-gradient(135deg, var(--card-bg) 0%, color-mix(in srgb, var(--surface) 60%, var(--card-bg)) 100%);">
		<div class="flex items-center gap-3 mb-5">
			<div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background: linear-gradient(135deg, var(--primary), var(--secondary));">
				<Icon icon="fa6-solid:pen-to-square" class="text-white text-base" />
			</div>
			<span class="font-bold text-lg text-90 tracking-wide">留下你的足迹</span>
			<div class="flex-1 h-px ml-2" style="background: linear-gradient(to right, var(--line-divider) 0%, transparent 100%);"></div>
		</div>
		
		<MessageEditor on:success={handleSuccess} {slug} />
	</div>

	<div class="flex flex-col gap-3">
		{#if loading}
			<div class="flex justify-center py-12">
				<div class="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
			</div>
		{:else if messages.length === 0}
			<div class="flex flex-col items-center justify-center py-12 text-30 gap-3">
				<div class="w-16 h-16 rounded-2xl flex items-center justify-center" style="background: color-mix(in srgb, var(--surface) 60%, transparent);">
					<Icon icon="fa6-solid:comment-dots" class="text-3xl" style="color: color-mix(in srgb, var(--primary) 40%, transparent);" />
				</div>
				<span class="text-sm text-50">还没有留言，快来抢沙发吧！</span>
			</div>
		{:else}
			{#each messages as msg (msg.id)}
				<MessageItem message={msg} on:replySuccess={handleSuccess} {slug} />
			{/each}
		{/if}
	</div>
</div>

<style>
	.message-form-card {
		border-radius: var(--radius-large);
	}
	@keyframes bounce-in {
		0% { transform: translateY(-20px); opacity: 0; }
		50% { transform: translateY(5px); }
		100% { transform: translateY(0); opacity: 1; }
	}
	.animate-bounce-in {
		animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
	}
	:global(.markdown-content p) {
		margin-bottom: 0.5em;
	}
	:global(.markdown-content p:last-child) {
		margin-bottom: 0;
	}
	:global(.markdown-content a) {
		color: var(--primary);
		text-decoration: underline;
	}
	:global(.markdown-content ul), :global(.markdown-content ol) {
		margin-left: 1.5em;
		margin-bottom: 0.5em;
	}
	:global(.markdown-content ul) {
		list-style-type: disc;
	}
	:global(.markdown-content ol) {
		list-style-type: decimal;
	}
	:global(.markdown-content blockquote) {
		border-left: 3px solid var(--primary);
		padding-left: 1em;
		margin-left: 0;
		margin-bottom: 0.5em;
		color: #666;
	}
	:global(.dark .markdown-content blockquote) {
		color: #aaa;
	}
	:global(.markdown-content code) {
		background-color: rgba(0, 0, 0, 0.1);
		padding: 0.2em 0.4em;
		border-radius: 4px;
		font-family: monospace;
		font-size: 0.9em;
	}
	:global(.dark .markdown-content code) {
		background-color: rgba(255, 255, 255, 0.1);
	}
	:global(.markdown-content pre) {
		background-color: #f5f5f5;
		padding: 1em;
		border-radius: 8px;
		overflow-x: auto;
		margin-bottom: 0.5em;
	}
	:global(.dark .markdown-content pre) {
		background-color: #1a1a1a;
	}
	:global(.markdown-content pre code) {
		background-color: transparent;
		padding: 0;
	}
	:global(.markdown-content .spoiler) {
		background-color: #000;
		color: #000;
		padding: 0 4px;
		border-radius: 4px;
		cursor: pointer;
		transition: color 0.3s;
	}
	:global(.dark .markdown-content .spoiler) {
		background-color: #fff;
		color: #fff;
	}
	:global(.markdown-content .spoiler:hover) {
		color: #fff;
	}
	:global(.dark .markdown-content .spoiler:hover) {
		color: #000;
	}
</style>
