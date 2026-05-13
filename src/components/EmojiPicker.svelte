<script>
import Icon from "@iconify/svelte";
import { createEventDispatcher } from "svelte";
import { fade, fly } from "svelte/transition";
import {
	EMOJI_PAGE_SIZE,
	emojiPacks,
	getEmojiInsertText,
	getEmojiPreviewSize,
	getGridColumns,
} from "../utils/emoji-packs";

const dispatch = createEventDispatcher();
const packIds = Object.keys(emojiPacks);

let isOpen = $state(false);
let activePackId = $state(packIds[0] ?? "");
let visibleCount = $state(EMOJI_PAGE_SIZE);

let activePack = $derived(emojiPacks[activePackId]);
let entries = $derived(Object.entries(activePack?.items ?? {}));
let visibleEntries = $derived(entries.slice(0, visibleCount));
let hasMore = $derived(visibleCount < entries.length);
let gridColumns = $derived(activePack ? getGridColumns(activePack) : 4);
let previewSize = $derived(activePack ? getEmojiPreviewSize(activePack) : 0);

function selectPack(packId) {
	activePackId = packId;
	visibleCount = EMOJI_PAGE_SIZE;
}

function handleEmojiClick(emojiName) {
	const text = getEmojiInsertText(activePackId, emojiName);
	if (!text) return;

	dispatch("select", text);
	isOpen = false;
}
</script>

<div class="relative">
	<button
		type="button"
		class="gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-all active:scale-95 flex items-center"
		style="background: color-mix(in srgb, var(--text-primary) 5%, transparent); color: color-mix(in srgb, var(--text-primary) 55%, transparent);"
		on:mouseenter={(e) => { e.target.style.background = 'color-mix(in srgb, var(--primary) 12%, transparent)'; e.target.style.color = 'var(--primary)'; }}
		on:mouseleave={(e) => { e.target.style.background = 'color-mix(in srgb, var(--text-primary) 5%, transparent)'; e.target.style.color = 'color-mix(in srgb, var(--text-primary) 55%, transparent)'; }}
		aria-label="选择表情"
		aria-expanded={isOpen}
		on:click={() => (isOpen = !isOpen)}
	>
		<Icon icon="fa6-regular:face-smile" class="text-base" />
		<span class="text-xs font-medium">表情</span>
	</button>

	{#if isOpen && activePack}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			class="fixed inset-0 z-40 cursor-default"
			on:click={() => (isOpen = false)}
			transition:fade={{ duration: 200 }}
		></div>

		<div
			class="absolute bottom-full left-0 z-50 mb-3 w-[min(22.5rem,calc(100vw-2rem))] overflow-hidden rounded-[var(--radius-large)] shadow-2xl transition-all border-0"
			style="background: var(--card-bg); box-shadow: 0 8px 40px var(--shadow-color);"
			transition:fly={{ y: 10, duration: 200 }}
		>
			<div class="max-h-[18rem] overflow-y-auto p-2 custom-scrollbar">
				{#if activePack.type === "text"}
					<div class="flex flex-wrap gap-1.5">
						{#each visibleEntries as [emojiName, data] (`${activePackId}-${emojiName}`)}
							<button
								type="button"
								class="rounded-md px-2 py-1 text-sm text-75 transition hover:bg-[var(--btn-plain-bg-hover)] active:bg-[var(--btn-plain-bg-active)] whitespace-nowrap"
								title={emojiName}
								on:click={() => handleEmojiClick(emojiName)}
							>
								{data}
							</button>
						{/each}
					</div>
				{:else}
					<div
						class="grid gap-1"
						style={`grid-template-columns: repeat(${gridColumns}, minmax(0, 1fr));`}
					>
						{#each visibleEntries as [emojiName, data] (`${activePackId}-${emojiName}`)}
							<button
								type="button"
								class="flex aspect-square items-center justify-center rounded-md p-1 transition hover:bg-[var(--btn-plain-bg-hover)] active:bg-[var(--btn-plain-bg-active)]"
								title={emojiName}
								on:click={() => handleEmojiClick(emojiName)}
							>
								<img
									src={data}
									alt={emojiName}
									width={previewSize}
									height={previewSize}
									loading="lazy"
									decoding="async"
									referrerpolicy="no-referrer"
									class="object-contain transition hover:scale-110"
									style={`width: ${previewSize}px; height: ${previewSize}px;`}
								/>
							</button>
						{/each}
					</div>
				{/if}

				{#if hasMore}
					<button
						type="button"
						class="btn-regular mt-2 w-full rounded-md py-2 text-sm"
						on:click={() => (visibleCount += EMOJI_PAGE_SIZE)}
					>
						显示更多
					</button>
				{/if}
			</div>

			<div class="border-t border-black/5 p-1 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
				<div class="flex gap-1 overflow-x-auto custom-scrollbar pb-1">
					{#each packIds as packId}
						<button
							type="button"
							class={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
								activePackId === packId
									? "bg-[var(--primary)] text-white shadow-sm"
									: "text-50 hover:bg-[var(--btn-plain-bg-hover)] active:bg-[var(--btn-plain-bg-active)]"
							}`}
							on:click={() => selectPack(packId)}
						>
							{emojiPacks[packId].name}
						</button>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.custom-scrollbar {
		scrollbar-width: thin;
		scrollbar-color: color-mix(in srgb, var(--text-primary) 15%, transparent) transparent;
	}
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
		height: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: color-mix(in srgb, var(--text-primary) 15%, transparent);
		border-radius: 10px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: color-mix(in srgb, var(--primary) 40%, transparent);
	}
</style>
