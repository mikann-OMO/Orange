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
	: `/assets/avatars/default-avatar-1.webp`);

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
		<div class="relative flex-shrink-0 self-start">
			<div class="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shadow-sm transition-all duration-500" style="border: 2px solid color-mix(in srgb, var(--primary) 25%, transparent); background: var(--btn-regular-bg);">
				<img 
					src={avatarPreview} 
					alt="Avatar" 
					class="w-full h-full object-cover transition-all duration-500 hover:scale-110"
				/>
			</div>
			<div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 bg-[var(--success)]" style="border-color: var(--card-bg);"></div>
		</div>
		<div class="flex-1 flex flex-col gap-3">
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
				<input 
					type="text" 
					bind:value={nickname}
					placeholder="昵称 *"
					class="w-full px-3.5 py-2.5 rounded-lg border-0 outline-none transition-all text-sm text-90"
					style="background: color-mix(in srgb, var(--text-primary) 3%, transparent); box-shadow: 0 0 0 1px color-mix(in srgb, var(--text-primary) 6%, transparent);"
					on:focus={(e) => { e.target.style.boxShadow = '0 0 0 2px var(--primary)'; e.target.style.background = 'var(--card-bg)'; }}
					on:blur={(e) => { e.target.style.boxShadow = '0 0 0 1px color-mix(in srgb, var(--text-primary) 6%, transparent)'; e.target.style.background = 'color-mix(in srgb, var(--text-primary) 3%, transparent)'; }}
					maxlength="20"
				/>
				<input 
					type="text" 
					bind:value={qq}
					placeholder="QQ号"
					class="w-full px-3.5 py-2.5 rounded-lg border-0 outline-none transition-all text-sm text-90"
					style="background: color-mix(in srgb, var(--text-primary) 3%, transparent); box-shadow: 0 0 0 1px color-mix(in srgb, var(--text-primary) 6%, transparent);"
					on:focus={(e) => { e.target.style.boxShadow = '0 0 0 2px var(--primary)'; e.target.style.background = 'var(--card-bg)'; }}
					on:blur={(e) => { e.target.style.boxShadow = '0 0 0 1px color-mix(in srgb, var(--text-primary) 6%, transparent)'; e.target.style.background = 'color-mix(in srgb, var(--text-primary) 3%, transparent)'; }}
					maxlength="11"
				/>
				<input 
					type="text" 
					bind:value={email}
					placeholder="邮箱"
					class="w-full px-3.5 py-2.5 rounded-lg border-0 outline-none transition-all text-sm text-90"
					style="background: color-mix(in srgb, var(--text-primary) 3%, transparent); box-shadow: 0 0 0 1px color-mix(in srgb, var(--text-primary) 6%, transparent);"
					on:focus={(e) => { e.target.style.boxShadow = '0 0 0 2px var(--primary)'; e.target.style.background = 'var(--card-bg)'; }}
					on:blur={(e) => { e.target.style.boxShadow = '0 0 0 1px color-mix(in srgb, var(--text-primary) 6%, transparent)'; e.target.style.background = 'color-mix(in srgb, var(--text-primary) 3%, transparent)'; }}
					maxlength="100"
				/>
				<input 
					type="text" 
					bind:value={website}
					placeholder="个人网站"
					class="w-full px-3.5 py-2.5 rounded-lg border-0 outline-none transition-all text-sm text-90"
					style="background: color-mix(in srgb, var(--text-primary) 3%, transparent); box-shadow: 0 0 0 1px color-mix(in srgb, var(--text-primary) 6%, transparent);"
					on:focus={(e) => { e.target.style.boxShadow = '0 0 0 2px var(--primary)'; e.target.style.background = 'var(--card-bg)'; }}
					on:blur={(e) => { e.target.style.boxShadow = '0 0 0 1px color-mix(in srgb, var(--text-primary) 6%, transparent)'; e.target.style.background = 'color-mix(in srgb, var(--text-primary) 3%, transparent)'; }}
					maxlength="100"
				/>
			</div>
			<textarea 
				bind:this={contentTextarea}
				bind:value={content}
				placeholder={placeholder}
				rows="3"
				class="w-full px-3.5 py-2.5 rounded-lg border-0 outline-none transition-all resize-none text-sm text-90 leading-relaxed"
				style="background: color-mix(in srgb, var(--text-primary) 3%, transparent); box-shadow: 0 0 0 1px color-mix(in srgb, var(--text-primary) 6%, transparent);"
				on:focus={(e) => { e.target.style.boxShadow = '0 0 0 2px var(--primary)'; e.target.style.background = 'var(--card-bg)'; }}
				on:blur={(e) => { e.target.style.boxShadow = '0 0 0 1px color-mix(in srgb, var(--text-primary) 6%, transparent)'; e.target.style.background = 'color-mix(in srgb, var(--text-primary) 3%, transparent)'; }}
				maxlength={MAX_CONTENT_LENGTH}
			></textarea>
		</div>
	</div>
	
	<div class="flex items-center justify-between gap-3">
		<div class="flex items-center gap-2 min-w-0">
			<EmojiPicker on:select={handleEmojiSelect} />
			<span class="hidden truncate text-[11px] text-30 sm:inline">
				支持 Markdown &middot; 表情 &middot; ||隐藏内容||
			</span>
		</div>
		<button 
			on:click={handleSubmit}
			disabled={submitting || !nickname || !content}
			class="shrink-0 px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md hover:shadow-lg"
			style="background: linear-gradient(135deg, var(--primary), var(--secondary));"
		>
			{#if submitting}
				<Icon icon="eos-icons:loading" class="text-base" />
				<span>发送中...</span>
			{:else}
				<Icon icon="fa6-solid:paper-plane" class="text-sm" />
				<span>发送</span>
			{/if}
		</button>
	</div>
</div>

<style>
	input::placeholder, textarea::placeholder {
		color: color-mix(in srgb, var(--text-primary) 25%, transparent);
		transition: color 0.2s;
	}
	input:focus::placeholder, textarea:focus::placeholder {
		color: color-mix(in srgb, var(--text-primary) 15%, transparent);
	}
</style>
