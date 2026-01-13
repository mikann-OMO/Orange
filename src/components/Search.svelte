<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { url } from "@utils/url-utils";
import { pinyin } from "pinyin-pro";
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
	// 添加拼音字段用于搜索
	titlePinyin?: string;
	titleFirstLetter?: string;
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
// 跟踪 Pagefind 加载状态
let isPagefindLoading = false;

// 存储文章索引的缓存
let articleIndexCache: SearchResult[] = [];
// 标记是否已加载文章索引
let isArticleIndexLoaded = false;

const fakeResult: SearchResult[] = [
	{
		url: url("/"),
		meta: {
			title: "This Is a Fake Search Result",
		},
		excerpt:
			"Because the search cannot work in the <mark>dev</mark> environment.",
		titlePinyin: "This Is a Fake Search Result",
		titleFirstLetter: "TIIF SR",
	},
	{
		url: url("/"),
		meta: {
			title: "If You Want to Test the Search",
		},
		excerpt: "Try running <mark>npm build && npm preview</mark> instead.",
		titlePinyin: "If You Want to Test the Search",
		titleFirstLetter: "IYWTTTS",
	},
];

// 防抖函数，延迟执行搜索
let searchTimeout: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_DELAY = 100; // 减少防抖延迟，实现更实时的搜索

// 优化的搜索面板可见性控制
const togglePanel = () => {
	isPanelVisible = !isPanelVisible;
	// 如果打开面板且 Pagefind 未加载，则尝试加载
	if (isPanelVisible && !pagefindLoaded && !isPagefindLoading) {
		loadPagefind();
	}
	// 如果打开面板且文章索引未加载，则尝试加载
	if (isPanelVisible && !isArticleIndexLoaded) {
		loadArticleIndex();
	}
};

const setPanelVisibility = (show: boolean) => {
	isPanelVisible = show;
	// 如果打开面板且 Pagefind 未加载，则尝试加载
	if (show && !pagefindLoaded && !isPagefindLoading) {
		loadPagefind();
	}
	// 如果打开面板且文章索引未加载，则尝试加载
	if (show && !isArticleIndexLoaded) {
		loadArticleIndex();
	}
};

// 加载 Pagefind 函数
const loadPagefind = async () => {
	if (pagefindLoaded || isPagefindLoading) return;

	isPagefindLoading = true;

	try {
		if (typeof window !== "undefined") {
			// 检查是否已经加载
			if ("pagefind" in window) {
				pagefindLoaded = true;
				return;
			}

			// 动态加载 Pagefind
			const scriptUrl = url("/pagefind/pagefind.js");
			const script = document.createElement("script");
			script.src = scriptUrl;

			await new Promise<void>((resolve, reject) => {
				script.onload = () => {
					// 确保 Pagefind 初始化
					if ("pagefind" in window) {
						pagefindLoaded = true;
						resolve();
					} else {
						reject(new Error("Pagefind loaded but not available"));
					}
				};
				script.onerror = () => reject(new Error("Failed to load Pagefind"));
				document.head.appendChild(script);
			});
		}
	} catch (error) {
		console.error("Error loading Pagefind:", error);
	} finally {
		isPagefindLoading = false;
	}
};

// 加载文章索引
const loadArticleIndex = async () => {
	if (isArticleIndexLoaded) return;

	try {
		// 尝试从 localStorage 加载缓存的文章索引
		if (typeof window !== "undefined" && window.localStorage) {
			const cachedIndex = localStorage.getItem("articleSearchIndex");
			if (cachedIndex) {
				articleIndexCache = JSON.parse(cachedIndex);
				isArticleIndexLoaded = true;
				return;
			}
		}

		// 如果没有缓存，则从 RSS 加载
		try {
			const response = await fetch("/rss.xml");
			if (response.ok) {
				const text = await response.text();
				const parser = new DOMParser();
				const xmlDoc = parser.parseFromString(text, "application/xml");

				const items = xmlDoc.querySelectorAll("item");
				const articles: SearchResult[] = [];

				items.forEach((item) => {
					const title = item.querySelector("title")?.textContent || "";
					const link = item.querySelector("link")?.textContent || "";
					const description =
						item.querySelector("description")?.textContent || "";

					// 转换为相对路径
					let relativeUrl = link;
					if (link.includes(window.location.origin)) {
						relativeUrl = link.replace(window.location.origin, "");
					}

					articles.push({
						url: relativeUrl,
						meta: {
							title,
						},
						excerpt: description,
						titlePinyin: getPinyin(title),
						titleFirstLetter: getFirstLetter(title),
					});
				});

				articleIndexCache = articles;
				isArticleIndexLoaded = true;

				// 缓存到 localStorage
				if (typeof window !== "undefined" && window.localStorage) {
					localStorage.setItem(
						"articleSearchIndex",
						JSON.stringify(articleIndexCache),
					);
				}

				return;
			}
		} catch (error) {
			console.error("Error loading from RSS:", error);
		}

		// 如果 RSS 加载失败，使用模拟数据
		articleIndexCache = fakeResult;
		isArticleIndexLoaded = true;

		// 缓存到 localStorage
		if (typeof window !== "undefined" && window.localStorage) {
			localStorage.setItem(
				"articleSearchIndex",
				JSON.stringify(articleIndexCache),
			);
		}
	} catch (error) {
		console.error("Error loading article index:", error);
	}
};

// 高亮关键词函数
const highlightKeyword = (text: string, keyword: string): string => {
	if (!keyword.trim()) return text;

	const regex = new RegExp(`(${keyword})`, "gi");
	return text.replace(
		regex,
		'<mark class="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">$1</mark>',
	);
};

// 拼音转换函数
const getPinyin = (text: string): string => {
	try {
		return pinyin(text, {
			style: "normal",
			withoutTone: true,
			separator: " ",
		});
	} catch (error) {
		console.error("Error converting to pinyin:", error);
		return text;
	}
};

// 获取首字母函数
const getFirstLetter = (text: string): string => {
	try {
		return pinyin(text, {
			style: "first",
			withoutTone: true,
			separator: "",
		});
	} catch (error) {
		console.error("Error getting first letter:", error);
		return text;
	}
};

// 模糊搜索函数
const fuzzySearch = (searchKeyword: string): SearchResult[] => {
	if (!searchKeyword.trim()) return [];

	const keyword = searchKeyword.toLowerCase();
	const results: SearchResult[] = [];

	// 遍历文章索引
	for (const article of articleIndexCache) {
		// 检查标题是否匹配
		const titleMatch = article.meta.title.toLowerCase().includes(keyword);
		// 检查拼音是否匹配
		const pinyinMatch = article.titlePinyin?.toLowerCase().includes(keyword);
		// 检查首字母是否匹配
		const firstLetterMatch = article.titleFirstLetter
			?.toLowerCase()
			.includes(keyword);
		// 检查摘要是否匹配
		const excerptMatch = article.excerpt.toLowerCase().includes(keyword);

		// 如果有任何匹配，则添加到结果中
		if (titleMatch || pinyinMatch || firstLetterMatch || excerptMatch) {
			results.push({
				...article,
				meta: {
					...article.meta,
					title: highlightKeyword(article.meta.title, searchKeyword),
				},
				excerpt: highlightKeyword(article.excerpt, searchKeyword),
			});
		}
	}

	return results;
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

	// 确保搜索面板显示
	if (isDesktop) {
		setPanelVisibility(true);
	}

	isSearching = true;

	try {
		let searchResults: SearchResult[] = [];

		// 无论是否在生产环境，都先尝试使用模糊搜索
		// 这样可以确保在 Pagefind 未加载时也能搜索
		searchResults = fuzzySearch(searchKeyword);

		// 检查是否在生产环境且 Pagefind 已加载
		if (import.meta.env.PROD && pagefindLoaded) {
			// 确保 window.pagefind 存在
			if (typeof window !== "undefined" && window.pagefind) {
				try {
					const response = await window.pagefind.search(searchKeyword);
					// 处理搜索结果
					if (response && response.results && response.results.length > 0) {
						searchResults = await Promise.all(
							response.results.map((item) => item.data()),
						);
						// 为 Pagefind 结果添加高亮
						searchResults = searchResults.map((item) => ({
							...item,
							meta: {
								...item.meta,
								title: highlightKeyword(item.meta.title, searchKeyword),
							},
							excerpt: highlightKeyword(item.excerpt, searchKeyword),
						}));
					}
				} catch (error) {
					console.error("Pagefind search error:", error);
					// Pagefind 搜索失败，继续使用模糊搜索结果
				}
			}
		}

		// 如果模糊搜索和 Pagefind 搜索都没有结果，使用模拟数据
		if (searchResults.length === 0) {
			searchResults = fakeResult.filter(
				(item) =>
					item.meta.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
					item.excerpt.toLowerCase().includes(searchKeyword.toLowerCase()) ||
					item.titlePinyin
						?.toLowerCase()
						.includes(searchKeyword.toLowerCase()) ||
					item.titleFirstLetter
						?.toLowerCase()
						.includes(searchKeyword.toLowerCase()),
			);

			// 高亮模拟数据中的关键词
			searchResults = searchResults.map((item) => ({
				...item,
				meta: {
					...item.meta,
					title: highlightKeyword(item.meta.title, searchKeyword),
				},
				excerpt: highlightKeyword(item.excerpt, searchKeyword),
			}));
		}

		result = searchResults;
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
		// 如果 Pagefind 未加载，则尝试加载
		if (!pagefindLoaded && !isPagefindLoading) {
			loadPagefind();
		}
		// 如果文章索引未加载，则尝试加载
		if (!isArticleIndexLoaded) {
			loadArticleIndex();
		}
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
	// 检查 Pagefind 是否已加载
	pagefindLoaded = typeof window !== "undefined" && "pagefind" in window;

	// 加载文章索引
	await loadArticleIndex();

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
