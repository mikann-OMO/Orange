<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { url } from "@utils/url-utils";
import { onMount, tick } from "svelte";

// 显式声明 SearchResult 类型
interface SearchResult {
	url: string;
	meta: {
		title: string;
	};
	excerpt: string;
	content?: string;
	word_count?: number;
	filters?: Record<string, unknown>;
	anchors?: Array<{
		element: string;
		id: string;
		text: string;
		location: number;
	}>;
	weighted_locations?: Array<{
		weight: number;
		balanced_score: number;
		location: number;
	}>;
	locations?: number[];
	raw_content?: string;
	raw_url?: string;
	sub_results?: SearchResult[];
}

// 合并关键字变量，使用单个变量管理搜索关键字
let keyword = "";
// 跟踪当前活跃的输入字段类型
let isDesktop = true;
let result: SearchResult[] = [];
let isSearching = false;
let pagefindLoaded = false;
// 跟踪搜索面板的可见性
let isPanelVisible = false;

const fakeResult: SearchResult[] = [
	{
		url: url("/"),
		meta: {
			title: "This Is a Fake Search Result",
		},
		excerpt:
			"Because the search cannot work in the <mark>dev</mark> environment.",
	},
	{
		url: url("/"),
		meta: {
			title: "If You Want to Test the Search",
		},
		excerpt: "Try running <mark>npm build && npm preview</mark> instead.",
	},
];

// 防抖函数，延迟执行搜索
let searchTimeout: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_DELAY = 300; // 300ms 防抖延迟

// 优化的搜索面板可见性控制
const togglePanel = () => {
	isPanelVisible = !isPanelVisible;
};

const setPanelVisibility = (show: boolean) => {
	isPanelVisible = show;
};

// 优化的搜索函数
const search = async (searchKeyword: string): Promise<void> => {
	if (!searchKeyword.trim()) {
		result = [];
		if (isDesktop) {
			setPanelVisibility(false);
		}
		return;
	}

	isSearching = true;

	try {
		let searchResults: SearchResult[] = [];

		if (import.meta.env.PROD && pagefindLoaded) {
			const response = await window.pagefind.search(searchKeyword);
			searchResults = await Promise.all(
				response.results.map((item) => item.data()),
			);
		} else {
			// 开发环境使用模拟数据，添加搜索关键词过滤
			searchResults = fakeResult.filter(
				(item) =>
					item.meta.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
					item.excerpt.toLowerCase().includes(searchKeyword.toLowerCase()),
			);
		}

		result = searchResults;
		if (isDesktop) {
			setPanelVisibility(true);
		}
	} catch (error) {
		console.error("Search error:", error);
		result = [];
	} finally {
		isSearching = false;
	}
};

// 优化的防抖搜索函数
const debouncedSearch = (searchKeyword: string): void => {
	if (searchTimeout) {
		clearTimeout(searchTimeout);
	}
	searchTimeout = setTimeout(() => {
		search(searchKeyword);
	}, DEBOUNCE_DELAY);
};

// 处理输入字段切换
const handleInputFocus = (desktop: boolean) => {
	isDesktop = desktop;
	if (keyword && desktop) {
		setPanelVisibility(true);
		search(keyword);
	}
};

// 键盘事件处理
const handleKeyDown = (event: KeyboardEvent) => {
	// ESC 键关闭搜索面板
	if (event.key === "Escape") {
		setPanelVisibility(false);
		return;
	}

	// 回车键触发搜索
	if (event.key === "Enter") {
		search(keyword);
		return;
	}
};

onMount(async () => {
	pagefindLoaded = typeof window !== "undefined" && "pagefind" in window;

	if (import.meta.env.DEV) {
		console.log(
			"Pagefind is not available in development mode. Using mock data.",
		);
	}
});

// 使用防抖函数替代直接搜索
$: debouncedSearch(keyword);

// 监听面板可见性变化，更新 DOM 类名
$: {
	const panel = document.getElementById("search-panel");
	if (panel) {
		if (isPanelVisible) {
			panel.classList.remove("float-panel-closed");
		} else {
			panel.classList.add("float-panel-closed");
		}
	}
}
</script>

<!-- search bar for desktop view -->
<div id="search-bar" class="hidden lg:flex transition-all duration-300 items-center h-11 mr-2 rounded-lg
      bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06]
      dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10
      backdrop-blur-sm">
    <Icon icon="material-symbols:search" class="absolute text-[1.25rem] pointer-events-none ml-3 transition-all duration-300 my-auto text-black/30 dark:text-white/30"></Icon>
    {#if isSearching}
        <Icon icon="material-symbols:rotate-right" class="absolute right-3 text-[1.25rem] animate-spin text-black/30 dark:text-white/30"></Icon>
    {/if}
    <input 
        placeholder="{i18n(I18nKey.search)}" 
        bind:value={keyword} 
        on:focus={() => handleInputFocus(true)}
        on:keydown={handleKeyDown}
        class="transition-all duration-300 ease-in-out pl-10 pr-10 text-sm bg-transparent outline-0
         h-full w-40 active:w-72 focus:w-72 text-black/75 dark:text-white/75 placeholder:text-black/30 dark:placeholder:text-white/30"
        aria-label="搜索"
    >
</div>

<!-- toggle btn for phone/tablet view -->
<button 
    on:click={togglePanel} 
    aria-label="Search Panel" 
    id="search-switch"
    class="btn-plain scale-animation lg:!hidden rounded-lg w-11 h-11 active:scale-90 transition-all duration-200"
>
    <Icon icon="material-symbols:search" class="text-[1.25rem]"></Icon>
</button>

<!-- search panel -->
<div 
    id="search-panel" 
    class="float-panel float-panel-closed search-panel absolute md:w-[30rem]
top-20 left-4 md:left-[unset] right-4 shadow-2xl rounded-2xl p-2 transition-all duration-300 ease-in-out backdrop-blur-sm"
    on:keydown={handleKeyDown}
    tabindex="0"
    role="region"
    aria-label="搜索结果"
>
    <!-- search bar inside panel for phone/tablet -->
    <div id="search-bar-inside" class="flex relative lg:hidden transition-all duration-300 items-center h-11 rounded-xl
      bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06]
      dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10
  ">
        <Icon icon="material-symbols:search" class="absolute text-[1.25rem] pointer-events-none ml-3 transition-all duration-300 my-auto text-black/30 dark:text-white/30"></Icon>
        {#if isSearching}
            <Icon icon="material-symbols:rotate-right" class="absolute right-3 text-[1.25rem] animate-spin text-black/30 dark:text-white/30"></Icon>
        {/if}
        <input 
            placeholder="{i18n(I18nKey.search)}" 
            bind:value={keyword} 
            on:focus={() => handleInputFocus(false)}
            on:keydown={handleKeyDown}
            class="pl-10 pr-10 absolute inset-0 text-sm bg-transparent outline-0
               focus:w-60 text-black/75 dark:text-white/75 placeholder:text-black/30 dark:placeholder:text-white/30"
            aria-label="搜索"
        >
    </div>

    <!-- search results -->
    <div class="mt-3 max-h-[calc(100vh-150px)] overflow-y-auto" role="list">
        {#if isSearching}
            <!-- 优化的加载状态 -->
            <div class="flex flex-col items-center justify-center py-12 text-center text-black/50 dark:text-white/50">
                <Icon icon="material-symbols:rotate-right" class="text-[2rem] animate-spin mb-4 text-black/30 dark:text-white/30"></Icon>
                <p class="text-lg font-medium">{i18n(I18nKey.searching)}</p>
            </div>
        {:else if result.length > 0}
            <!-- 搜索结果列表 -->
            {#each result as item, index}
                <a 
                    href={item.url}
                    class="transition-all duration-200 first-of-type:mt-0 group block
               rounded-xl text-lg px-3 py-3 hover:bg-[var(--btn-plain-bg-hover)] active:bg-[var(--btn-plain-bg-active)] hover:translate-x-1"
                    role="listitem"
                    aria-label={`搜索结果：${item.meta.title}`}
                >
                    <div class="transition-all duration-200 text-90 inline-flex font-bold group-hover:text-[var(--primary)]">
                        {item.meta.title}
                        <Icon 
                            icon="fa6-solid:chevron-right" 
                            class="transition-all duration-200 text-[0.75rem] translate-x-1 my-auto text-[var(--primary)] opacity-0 group-hover:opacity-100"
                        ></Icon>
                    </div>
                    <div class="transition-all duration-200 text-sm text-50 mt-1">
                        {@html item.excerpt}
                    </div>
                </a>
            {/each}
        {:else if keyword.trim()}
            <!-- 空结果状态 -->
            <div class="flex flex-col items-center justify-center py-16 text-center text-black/50 dark:text-white/50">
                <Icon icon="material-symbols:search-off" class="text-[3.5rem] mb-6 text-black/30 dark:text-white/30"></Icon>
                <p class="text-lg font-medium mb-2">{i18n(I18nKey.noResults)}</p>
                <p class="text-sm max-w-xs">{i18n(I18nKey.tryDifferentKeywords)}</p>
                <!-- 清空搜索按钮 -->
                <button 
                    on:click={() => { keyword = ""; setPanelVisibility(false); }}
                    class="mt-6 px-4 py-2 text-sm rounded-lg bg-[var(--btn-plain-bg)] hover:bg-[var(--btn-plain-bg-hover)] transition-colors"
                >
                    清空搜索
                </button>
            </div>
        {:else}
            <!-- 初始状态 -->
            <div class="flex flex-col items-center justify-center py-16 text-center text-black/50 dark:text-white/50">
                <Icon icon="material-symbols:search" class="text-[3.5rem] mb-6 text-black/30 dark:text-white/30"></Icon>
                <p class="text-lg font-medium mb-2">{i18n(I18nKey.search)}</p>
                <p class="text-sm max-w-xs">{i18n(I18nKey.enterKeywordsToSearch)}</p>
            </div>
        {/if}
    </div>
</div>

<style>
  /* 搜索组件样式优化 */
  
  /* 基础输入样式 */
  input:focus {
    outline: 0;
  }
  
  /* 搜索面板基础样式 */
  .search-panel {
    max-height: calc(100vh - 100px);
    overflow-y: auto;
  }
  
  /* 搜索面板滚动条样式 */
  .search-panel::-webkit-scrollbar {
    width: 6px;
  }
  
  .search-panel::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .search-panel::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
    transition: background 0.2s ease;
  }
  
  /* 深色模式下的滚动条样式 */
  .dark .search-panel::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
  }
  
  /* 滚动条悬停效果 */
  .search-panel::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.15);
  }
  
  .dark .search-panel::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.15);
  }
  
  /* 搜索结果动画效果 */
  .search-panel a {
    animation: fadeIn 0.2s ease-out;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* 加载动画优化 */
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  .animate-spin {
    animation: spin 0.8s linear infinite;
  }
</style>
