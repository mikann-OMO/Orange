<script context="module">
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import { installEmojiPackRule } from "../utils/emoji-packs";

const md = new MarkdownIt({
	html: true,
	breaks: true,
	linkify: true,
});
installEmojiPackRule(md);

const sanitizeOptions = {
	allowedTags: sanitizeHtml.defaults.allowedTags.concat([
		"img",
		"details",
		"summary",
		"span",
		"h1",
		"h2",
	]),
	allowedAttributes: {
		...sanitizeHtml.defaults.allowedAttributes,
		img: [
			"src",
			"alt",
			"title",
			"class",
			"width",
			"height",
			"loading",
			"decoding",
			"referrerpolicy",
		],
		span: ["class"],
	},
	allowedClasses: {
		img: ["emoji", "emoji-sticker"],
		span: ["spoiler"],
	},
	allowedSchemes: ["http", "https", "mailto"],
};

function renderContent(text) {
	const withSpoilers = text.replace(
		/\|\|(.*?)\|\|/g,
		'<span class="spoiler">$1</span>',
	);

	const rawHtml = md.render(withSpoilers);

	return sanitizeHtml(rawHtml, sanitizeOptions);
}
</script>

<script>
import Icon from "@iconify/svelte";
import { createEventDispatcher } from "svelte";
import MessageEditor from "./MessageEditor.svelte";

/** @type {{ message: import("../types/message").Message, depth?: number, slug?: string }} */
let {
	message,
	depth = 0,
	slug = "message-board",
} = $props();

const dispatch = createEventDispatcher();
let showReply = $state(false);

function timeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "刚刚";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    return `${days}天前`;
}

function handleReplySuccess(e) {
    showReply = false;
    dispatch("replySuccess", e.detail);
}
</script>

<div class="flex flex-col gap-3">
	<div class="card-base !overflow-visible p-3 sm:p-4 border-0 shadow-sm transition-all hover:shadow-md group/msg" style="border-left: 3px solid color-mix(in srgb, var(--primary) 30%, transparent);">
		<div class="flex gap-3 sm:gap-4">
			<div class="relative flex-shrink-0 mt-0.5">
				{#if message.website}
					<a href={message.website} target="_blank" rel="noopener noreferrer" class="block">
						<div class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden transition-all duration-300" style="box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary) 30%, transparent), 0 0 0 3px var(--card-bg);">
							<img src={message.avatar} alt={message.nickname} class="w-full h-full object-cover transition-transform duration-300 group-hover/msg:scale-105" />
						</div>
					</a>
				{:else}
					<div class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden transition-all duration-300" style="box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary) 30%, transparent), 0 0 0 3px var(--card-bg);">
						<img src={message.avatar} alt={message.nickname} class="w-full h-full object-cover" />
					</div>
				{/if}
				<div class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2" style="background: var(--success); border-color: var(--card-bg);"></div>
			</div>
			<div class="flex-1 min-w-0">
				<div class="flex items-center justify-between gap-2 mb-1 flex-wrap">
					<div class="flex items-center gap-2 min-w-0 flex-wrap">
						{#if message.website}
							<a href={message.website} target="_blank" rel="noopener noreferrer" class="font-bold text-sm text-90 hover:text-[var(--primary)] transition-colors flex items-center gap-1 min-w-0 group/link">
								<span class="truncate max-w-[160px]">{message.nickname}</span>
								<Icon icon="fa6-solid:link" class="text-[10px] opacity-0 group-hover/link:opacity-100 transition-opacity text-50 flex-shrink-0" />
							</a>
						{:else}
							<span class="font-bold text-sm text-90 truncate max-w-[160px]">{message.nickname}</span>
						{/if}
						<span class="text-[10px] px-1.5 py-px rounded-md text-50 flex-shrink-0" style="background: linear-gradient(135deg, color-mix(in srgb, var(--primary) 15%, transparent), color-mix(in srgb, var(--secondary) 10%, transparent));">
							Lv.1
						</span>
					</div>
					<div class="flex items-center gap-2 flex-shrink-0">
						<time class="text-[11px] text-50">{timeAgo(message.createdAt)}</time>
						<button 
							class="text-[11px] font-medium transition-colors flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-[var(--surface-hover)]"
							style="color: color-mix(in srgb, var(--primary) 70%, transparent);"
							on:click={() => showReply = !showReply}
						>
							<Icon icon={showReply ? "fa6-solid:xmark" : "fa6-solid:reply"} class="text-[10px]" />
							{showReply ? '取消' : '回复'}
						</button>
					</div>
				</div>

				{#if message.os || message.browser}
					<div class="hidden sm:flex items-center gap-1.5 text-[10px] text-50 mb-1.5 flex-wrap">
						{#if message.device}
							<span class="flex items-center gap-0.5 px-1.5 py-px rounded-md" style="background: color-mix(in srgb, var(--text-primary) 4%, transparent);">
								<Icon icon="fa6-solid:mobile" />
								{message.device}
							</span>
						{/if}
						{#if message.os}
							<span class="flex items-center gap-0.5 px-1.5 py-px rounded-md" style="background: color-mix(in srgb, var(--text-primary) 4%, transparent);">
								{#if !message.device}
									<Icon icon="fa6-solid:laptop" />
								{/if}
								{message.os}
							</span>
						{/if}
						{#if message.browser}
							<span class="flex items-center gap-0.5 px-1.5 py-px rounded-md" style="background: color-mix(in srgb, var(--text-primary) 4%, transparent);">
								<Icon icon="fa6-solid:globe" />
								{message.browser}
							</span>
						{/if}
					</div>
				{/if}

				<div class="mt-1.5 text-75 text-sm leading-relaxed custom-md">
					{@html renderContent(message.content)}
				</div>
				
				{#if showReply}
					<div class="mt-3 pt-3 animate-fade-in" style="border-top: 1px solid var(--line-divider);">
						<MessageEditor 
							parentId={message.id} 
							placeholder={`回复 @${message.nickname}...`}
							autofocus={true}
							on:success={handleReplySuccess}
							{slug}
						/>
					</div>
				{/if}
			</div>
		</div>
	</div>

	{#if message.replies && message.replies.length > 0}
		<div class="flex flex-col gap-3 pl-6 sm:pl-10 ml-3 sm:ml-5" style="border-left: 2px solid color-mix(in srgb, var(--primary) 15%, transparent);">
			{#each message.replies as reply (reply.id)}
				<svelte:self message={reply} depth={depth + 1} on:replySuccess {slug} />
			{/each}
		</div>
	{/if}
</div>

<style>
	.card-base {
		border-radius: var(--radius-large);
		background-color: var(--card-bg);
	}
	.animate-fade-in {
		animation: fade-in 0.3s ease-out;
	}
	@keyframes fade-in {
		from { opacity: 0; transform: translateY(-10px); }
		to { opacity: 1; transform: translateY(0); }
	}
	:global(.custom-md .emoji) {
		display: inline-block;
		vertical-align: text-bottom;
		object-fit: contain;
		margin: 0 0.1em;
		border-radius: 0.35rem;
		max-width: min(7rem, 100%);
		max-height: 7rem;
		cursor: default;
	}
	:global(.custom-md .emoji-sticker) {
		vertical-align: middle;
		margin: 0.15rem 0.2rem;
	}
</style>
