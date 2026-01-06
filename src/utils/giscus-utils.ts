import type { CollectionEntry } from "astro:content";
import { getPostUrlBySlug } from "./url-utils";

// Giscus 配置信息（从评论区配置中获取）
export const giscusConfig = {
	repo: "mikann-OMO/comments",
	repoId: "R_kgDOO3ArSw",
	category: "Q&A",
	categoryId: "DIC_kwDOO3ArS84CrGgL",
};

// GitHub API 配置
const GITHUB_API_CONFIG = {
	baseUrl: "https://api.github.com",
	// 从环境变量获取 GitHub Personal Access Token（如果存在）
	token: import.meta.env.PUBLIC_GITHUB_TOKEN || undefined,
	headers: {
		Accept: "application/vnd.github.v3+json",
	},
	// API 请求超时时间（毫秒）
	timeout: 10000,
};

// 缓存配置
const CACHE_CONFIG = {
	// 缓存有效期（毫秒）
	duration: 5 * 60 * 1000, // 5分钟
	// 缓存存储
	store: new Map<string, { data: unknown; timestamp: number }>(),
};

// 为 API 请求创建完整的请求头
const createApiHeaders = () => {
	const headers = { ...GITHUB_API_CONFIG.headers };
	if (GITHUB_API_CONFIG.token) {
		(headers as Record<string, string>).Authorization =
			`token ${GITHUB_API_CONFIG.token}`;
	}
	return headers;
};

// 缓存包装函数
const withCache = async <T>(
	key: string,
	fetcher: () => Promise<T>,
): Promise<T> => {
	// 检查缓存是否有效
	const cached = CACHE_CONFIG.store.get(key);
	if (cached && Date.now() - cached.timestamp < CACHE_CONFIG.duration) {
		return cached.data as T;
	}

	// 执行请求并缓存结果
	const data = await fetcher();
	CACHE_CONFIG.store.set(key, {
		data,
		timestamp: Date.now(),
	});
	return data;
};

// GitHub API 讨论数据类型
interface GitHubDiscussion {
	id: number;
	title: string;
	comments_url: string;
	html_url: string;
	category?: {
		id: string;
	};
}

// GitHub API 评论数据类型
interface GitHubComment {
	id: number;
	body: string;
	user: {
		login: string;
		avatar_url: string;
	};
	created_at: string;
	updated_at: string;
	html_url: string;
}

// 评论数据类型
export interface GiscusComment {
	id: string;
	body: string;
	author: {
		login: string;
		avatarUrl: string;
	};
	createdAt: string;
	updatedAt: string;
	url: string;
	postSlug?: string;
	postTitle?: string;
}

// 带超时的 fetch 函数
const fetchWithTimeout = async (url: string, options: RequestInit = {}) => {
	const controller = new AbortController();
	const timeoutId = setTimeout(
		() => controller.abort(),
		GITHUB_API_CONFIG.timeout,
	);

	try {
		const response = await fetch(url, {
			...options,
			signal: controller.signal,
		});
		clearTimeout(timeoutId);
		return response;
	} catch (error) {
		clearTimeout(timeoutId);
		if (error instanceof Error && error.name === "AbortError") {
			throw new Error(`Request timed out after ${GITHUB_API_CONFIG.timeout}ms`);
		}
		throw error;
	}
};

// 通用分页获取函数
const fetchPaginatedData = async <T>(
	url: string,
	allData: T[] = [],
): Promise<T[]> => {
	try {
		const response = await fetchWithTimeout(url, {
			headers: createApiHeaders(),
		});

		if (!response.ok) {
			// 处理 API 错误
			const errorText = await response.text().catch(() => "No error text");
			// 特别处理速率限制
			if (response.status === 403 && errorText.includes("rate limit")) {
				throw new Error(
					"GitHub API rate limit exceeded. Please try again later.",
				);
			}
			throw new Error(
				`GitHub API error: ${response.status} ${response.statusText}\n${errorText}`,
			);
		}

		const data = await response.json();
		const newData = [...allData, ...data];

		// 检查是否有下一页
		const linkHeader = response.headers.get("Link");
		if (linkHeader) {
			const nextMatch = linkHeader.match(/<([^>]+)>; rel="next"/);
			if (nextMatch) {
				return fetchPaginatedData(nextMatch[1], newData);
			}
		}

		return newData;
	} catch (error) {
		// 在开发环境中，如果是证书验证错误，可以提供更友好的提示
		if (import.meta.env.DEV && error instanceof Error) {
			if (error.message.includes("UNABLE_TO_VERIFY_LEAF_SIGNATURE")) {
				console.warn(
					"Development environment certificate error. To fix this:",
					"1. Set NODE_TLS_REJECT_UNAUTHORIZED=0 in your environment before starting the dev server",
					"2. Or install proper SSL certificates for your development environment",
				);
			}
		}
		// 重新抛出错误，让调用者处理
		throw error;
	}
};

// 通过 GitHub API 获取所有 giscus 评论（支持分页和缓存）
export async function getAllGiscusComments(): Promise<GiscusComment[]> {
	const cacheKey = "giscus:comments:all";

	return withCache(cacheKey, async () => {
		try {
			// 获取所有讨论
			const discussionsUrl = `${GITHUB_API_CONFIG.baseUrl}/repos/${giscusConfig.repo}/discussions?per_page=100`;
			const allDiscussions =
				await fetchPaginatedData<GitHubDiscussion>(discussionsUrl);

			// 过滤出 giscus 使用的讨论（根据 categoryId 判断）
			const giscusDiscussions = allDiscussions.filter(
				(discussion) => discussion.category?.id === giscusConfig.categoryId,
			);

			// 对于每个讨论，获取其评论（支持分页）
			const getCommentsForDiscussion = async (
				discussion: GitHubDiscussion,
			): Promise<GiscusComment[]> => {
				try {
					// 从 pathname 中提取文章 slug
					const pathname = discussion.title;
					const slugMatch = pathname.match(/^\/posts\/(.*)\/$/);
					const postSlug = slugMatch ? slugMatch[1] : undefined;

					// 如果没有匹配到文章 slug，跳过此讨论
					if (!postSlug) return [];

					// 获取讨论的所有评论
					const commentsUrl = `${discussion.comments_url}?per_page=100`;
					const allComments =
						await fetchPaginatedData<GitHubComment>(commentsUrl);

					// 转换评论数据格式
					return allComments
						.filter((comment) => comment?.user) // 过滤掉无效评论，使用可选链
						.map((comment) => ({
							id: comment.id.toString(),
							body: comment.body || "",
							author: {
								login: comment.user.login || "unknown",
								avatarUrl: comment.user.avatar_url || "",
							},
							createdAt: comment.created_at || new Date().toISOString(),
							updatedAt: comment.updated_at || new Date().toISOString(),
							url: comment.html_url || discussion.html_url,
							postSlug,
						}));
				} catch (error) {
					console.warn(
						`Failed to fetch comments for discussion ${discussion.id}:`,
						error,
					);
					return [];
				}
			};

			// 并行获取所有讨论的评论，使用 Promise.allSettled 处理部分失败情况
			const commentsPromises = giscusDiscussions.map(getCommentsForDiscussion);
			const commentsResults = await Promise.allSettled(commentsPromises);

			// 合并所有成功的评论数组
			const comments = commentsResults
				.filter(
					(result): result is PromiseFulfilledResult<GiscusComment[]> =>
						result.status === "fulfilled",
				)
				.flatMap((result) => result.value)
				.filter(Boolean); // 过滤掉空评论

			// 按创建时间排序（最新的在前）
			return comments.sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
			);
		} catch (error) {
			console.error("Failed to fetch giscus comments:", error);
			// 返回空数组以确保应用程序不会崩溃
			return [];
		}
	});
}

// 获取文章信息（标题等）
export async function enrichCommentsWithPostInfo(
	comments: GiscusComment[],
	posts: CollectionEntry<"posts">[],
): Promise<GiscusComment[]> {
	// 创建文章映射，提高查找效率
	const postMap = new Map(posts.map((post) => [post.slug, post.data.title]));

	// 使用 map 进行转换，性能更好
	return comments.map((comment) => {
		if (!comment.postSlug) return comment;

		const postTitle = postMap.get(comment.postSlug);
		if (postTitle) {
			return {
				...comment,
				postTitle,
			};
		}

		return comment;
	});
}
