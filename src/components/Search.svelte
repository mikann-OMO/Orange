<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { url } from "@utils/url-utils";
import { onDestroy, onMount } from "svelte";

let keyword = "";
let isSearching = false;
let pagefindLoaded = false;
let showSuggestions = false;
let suggestions: Array<{ title: string; url: string; excerpt: string }> = [];
let selectedSuggestionIndex = -1;

let searchTimeout: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_DELAY = 150;

let postsIndex: Array<{
	title: string;
	url: string;
	description: string;
	category: string;
	tags: string[];
	body: string;
}> = [];
let postsLoaded = false;

const loadPostsIndex = async () => {
	if (postsLoaded) return;

	try {
		const response = await fetch("/api/posts.json");
		if (response.ok) {
			postsIndex = await response.json();
			postsLoaded = true;
		}
	} catch (error) {
		console.error("Failed to load posts index:", error);
	}
};

const loadPagefind = async () => {
	// 在 SSR 模式下禁用 Pagefind
	return;
};

const search = async (searchKeyword: string): Promise<void> => {
	if (!searchKeyword.trim()) {
		suggestions = [];
		showSuggestions = false;
		return;
	}

	isSearching = true;

	try {
		// 在所有环境下都使用本地 postsIndex 进行搜索
		await loadPostsIndex();
		const lowerKeyword = searchKeyword.toLowerCase();
		suggestions = postsIndex
			.filter(
				(item) =>
					item.title.toLowerCase().includes(lowerKeyword) ||
					item.description.toLowerCase().includes(lowerKeyword) ||
					item.category.toLowerCase().includes(lowerKeyword) ||
					item.tags.some((tag) => tag.toLowerCase().includes(lowerKeyword)) ||
					item.body.toLowerCase().includes(lowerKeyword),
			)
			.slice(0, 5)
			.map((item) => ({
				title: item.title,
				url: item.url,
				excerpt: item.description || item.body.substring(0, 100),
			}));
		showSuggestions = suggestions.length > 0;
	} catch (error) {
		console.error("Search error:", error);
	} finally {
		isSearching = false;
	}
};

const debouncedSearch = (searchKeyword: string): void => {
	if (searchTimeout) {
		clearTimeout(searchTimeout);
	}
	searchTimeout = setTimeout(() => {
		search(searchKeyword);
	}, DEBOUNCE_DELAY);
};

const handleKeyDown = (event: KeyboardEvent) => {
	if (event.key === "Enter") {
		if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
			window.location.href = suggestions[selectedSuggestionIndex].url;
		}
		return;
	}

	if (event.key === "ArrowDown") {
		event.preventDefault();
		if (showSuggestions && suggestions.length > 0) {
			selectedSuggestionIndex =
				(selectedSuggestionIndex + 1) % suggestions.length;
		}
	} else if (event.key === "ArrowUp") {
		event.preventDefault();
		if (showSuggestions && suggestions.length > 0) {
			selectedSuggestionIndex =
				(selectedSuggestionIndex - 1 + suggestions.length) % suggestions.length;
		}
	} else if (event.key === "Escape") {
		showSuggestions = false;
	}
};

const selectSuggestion = (suggestion: { url: string }) => {
	window.location.href = suggestion.url;
};

const handleClickOutside = (event: MouseEvent) => {
	const searchContainer = document.querySelector(".search-container");
	if (searchContainer && !searchContainer.contains(event.target as Node)) {
		showSuggestions = false;
	}
};

onMount(async () => {
	// 在所有环境下都加载 postsIndex
	await loadPostsIndex();

	document.addEventListener("click", handleClickOutside);
});

onDestroy(() => {
	document.removeEventListener("click", handleClickOutside);
});

$: debouncedSearch(keyword);
</script>

<div class="search-container relative">
    <div id="search-bar" class="flex items-center h-11 mr-2 rounded-lg relative bg-orange-100/80 dark:bg-stone-800/80 border border-orange-200 dark:border-stone-700">
        <Icon icon="material-symbols:search" class="absolute text-[1.25rem] pointer-events-none ml-3 my-auto text-orange-700 dark:text-orange-400"></Icon>
        {#if isSearching}
            <Icon icon="material-symbols:rotate-right" class="absolute right-3 text-[1.25rem] text-orange-700 dark:text-orange-400 animate-spin"></Icon>
        {/if}
        <input
            type="text"
            id="search-input"
            placeholder={i18n(I18nKey.search)}
            bind:value={keyword}
            class="pl-10 pr-10 text-sm bg-transparent outline-0 h-full w-32 sm:w-48 md:w-56 text-orange-900 dark:text-white placeholder:text-orange-500 dark:placeholder:text-orange-400"
            aria-label="搜索"
            on:keydown={handleKeyDown}
            on:focus={() => showSuggestions = keyword.trim() !== ""}
        >
        {#if keyword}
            <button 
                class="absolute right-3 text-[1.25rem] text-orange-700 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300"
                on:click={() => {
                    keyword = "";
                    suggestions = [];
                    showSuggestions = false;
                }}
                aria-label="清除搜索"
            >
                <Icon icon="material-symbols:close" />
            </button>
        {/if}
    </div>
    
    {#if showSuggestions && suggestions.length > 0}
        <div class="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-stone-800 border border-orange-200 dark:border-stone-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {#each suggestions as suggestion, index}
                <div 
                    role="button"
                    tabindex="0"
                    class={`p-3 hover:bg-orange-100 dark:hover:bg-stone-700 cursor-pointer transition-colors ${index === selectedSuggestionIndex ? 'bg-orange-50 dark:bg-stone-700' : ''}`}
                    on:click={() => selectSuggestion(suggestion)}
                    on:mouseenter={() => selectedSuggestionIndex = index}
                    on:keydown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            selectSuggestion(suggestion);
                        }
                    }}
                >
                    <div class="font-medium text-orange-900 dark:text-white">{suggestion.title}</div>
                    <div class="text-sm text-orange-500 dark:text-orange-400 mt-1 line-clamp-1">{suggestion.excerpt}</div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
  input:focus {
    outline: 0;
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
