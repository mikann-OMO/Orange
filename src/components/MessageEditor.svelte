<script>
import Icon from "@iconify/svelte";
import { createEventDispatcher, tick } from "svelte";
import EmojiPicker from "./EmojiPicker.svelte";

/** @type {{ parentId?: string, placeholder?: string, autofocus?: boolean, slug?: string }} */
let {
	parentId = undefined,
	placeholder = "说点什么吧... (支持 Markdown、表情和 ||隐藏内容||)",
	autofocus = false,
	slug = "message-board",
} = $props();

const dispatch = createEventDispatcher();
const MAX_CONTENT_LENGTH = 500;

let nickname = $state("");
let qq = $state("");
let email = $state("");
let website = $state("");
let content = $state("");
let submitting = $state(false);
let contentTextarea = $state(undefined);

let avatarPreview = $derived(qq?.match(/^\d{5,11}$/)
	? `https://q1.qlogo.cn/g?b=qq&nk=${qq}&s=100`
	: `https://api.dicebear.com/7.x/identicon/svg?seed=${nickname || "anonymous"}`);

$effect(() => {
	if (typeof localStorage === "undefined") return;
	localStorage.setItem("message_nickname", nickname);
});
$effect(() => {
	if (typeof localStorage === "undefined" || !qq) return;
	localStorage.setItem("message_qq", qq);
});
$effect(() => {
	if (typeof localStorage === "undefined" || !email) return;
	localStorage.setItem("message_email", email);
});
$effect(() => {
	if (typeof localStorage === "undefined" || !website) return;
	localStorage.setItem("message_website", website);
});

$effect(() => {
	nickname = localStorage.getItem("message_nickname") || "";
	qq = localStorage.getItem("message_qq") || "";
	email = localStorage.getItem("message_email") || "";
	website = localStorage.getItem("message_website") || "";

	if (autofocus && contentTextarea) {
		contentTextarea.focus();
	}
});

async function handleSubmit() {
	if (!nickname.trim() || !content.trim()) return;
	submitting = true;
	try {
		const res = await fetch("/api/messages/", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				nickname,
				qq,
				content,
				email,
				website,
				parentId,
				slug,
			}),
		});

		const data = await res.json();
		if (res.ok) {
			content = "";
			dispatch("success", data);
		} else {
			alert(data.error || "发送失败，请重试");
		}
	} catch (e) {
		console.error("Failed to post message", e);
		alert("发送失败，请检查网络连接");
	} finally {
		submitting = false;
	}
}

async function handleEmojiSelect(event) {
	const emoji = event.detail;
	if (!emoji || !contentTextarea) return;

	const start = contentTextarea.selectionStart ?? content.length;
	const end = contentTextarea.selectionEnd ?? content.length;
	const before = content.slice(0, start);
	const after = content.slice(end);
	const nextContent = `${before}${emoji}${after}`.slice(0, MAX_CONTENT_LENGTH);
	const nextCursor = Math.min(start + emoji.length, nextContent.length);

	content = nextContent;
	await tick();

	contentTextarea.focus();
	contentTextarea.setSelectionRange(nextCursor, nextCursor);
}
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-col sm:flex-row gap-4">
		<div class="w-16 h-16 rounded-[var(--radius-large)] bg-[var(--btn-regular-bg)] overflow-hidden flex-shrink-0 border border-black/5 dark:border-white/5 shadow-sm self-start">
			<img 
				src={avatarPreview} 
				alt="Avatar" 
				class="w-full h-full object-cover transition-all duration-500"
			/>
		</div>
		<div class="flex-1 flex flex-col gap-3">
			<div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
				<input 
					type="text" 
					bind:value={nickname}
					placeholder="昵称 (必填)"
					class="w-full px-4 py-2 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border-none focus:ring-2 focus:ring-[var(--primary)] transition-all text-90 placeholder:text-neutral-400 outline-none"
					maxlength="20"
				/>
				<input 
					type="text" 
					bind:value={qq}
					placeholder="QQ号 (可选)"
					class="w-full px-4 py-2 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border-none focus:ring-2 focus:ring-[var(--primary)] transition-all text-90 placeholder:text-neutral-400 outline-none"
					maxlength="11"
				/>
				<input 
					type="text" 
					bind:value={email}
					placeholder="邮箱 (可选)"
					class="w-full px-4 py-2 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border-none focus:ring-2 focus:ring-[var(--primary)] transition-all text-90 placeholder:text-neutral-400 outline-none"
					maxlength="100"
				/>
				<input 
					type="text" 
					bind:value={website}
					placeholder="个人网站 (可选)"
					class="w-full px-4 py-2 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border-none focus:ring-2 focus:ring-[var(--primary)] transition-all text-90 placeholder:text-neutral-400 outline-none"
					maxlength="100"
				/>
			</div>
			<textarea 
				bind:this={contentTextarea}
				bind:value={content}
				placeholder={placeholder}
				rows="3"
				class="w-full px-4 py-2 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] border-none focus:ring-2 focus:ring-[var(--primary)] transition-all resize-none text-90 placeholder:text-neutral-400 outline-none"
				maxlength={MAX_CONTENT_LENGTH}
			></textarea>
		</div>
	</div>
	
	<div class="flex items-center justify-between gap-3">
		<div class="flex min-w-0 items-center gap-2">
			<EmojiPicker on:select={handleEmojiSelect} />
			<span class="hidden truncate text-xs text-30 sm:inline">
				支持 Markdown、预设表情、||隐藏内容||
			</span>
		</div>
		<button 
			on:click={handleSubmit}
			disabled={submitting || !nickname || !content}
			class="btn-regular px-6 py-2 rounded-lg flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed !bg-[var(--primary)] !text-white"
		>
			{#if submitting}
				<Icon icon="eos-icons:loading" />
				<span>发送中...</span>
			{:else}
				<Icon icon="fa6-solid:paper-plane" />
				<span>发送</span>
			{/if}
		</button>
	</div>
</div>

<style>
	input::placeholder, textarea::placeholder {
		@apply transition-colors;
	}
</style>
