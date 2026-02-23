import type { CollectionEntry } from "astro:content";

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
	// 建议在生产环境中设置此变量以避免 API 速率限制
	token: import.meta.env.PUBLIC_GITHUB_TOKEN || undefined,
	headers: {
		Accept: "application/vnd.github.v3+json",
	},
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

// 通用分页获取函数
const fetchPaginatedData = async <T>(
	url: string,
	allData: T[] = [],
): Promise<T[]> => {
	try {
		// 在 Astro 中，fetch API 在服务器端和客户端都能正常工作
		const response = await fetch(url, {
			headers: createApiHeaders(),
			// 注意：fetch API 没有直接的 rejectUnauthorized 选项
			// 在生产环境中，证书验证是必须的
		});

		if (!response.ok) {
			// 处理 API 错误
			const errorText = await response.text().catch(() => "No error text");
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

// 通过 GitHub API 获取所有 giscus 评论（支持分页）
export async function getAllGiscusComments(): Promise<GiscusComment[]> {
	try {
		// 在 Astro 中，这个函数可能在服务器端或客户端运行
		// 我们需要确保所有操作都兼容这两种环境

		// 获取所有讨论
		const discussionsUrl = `${GITHUB_API_CONFIG.baseUrl}/repos/${giscusConfig.repo}/discussions?per_page=100`;
		const allDiscussions =
			await fetchPaginatedData<GitHubDiscussion>(discussionsUrl);

		// 过滤出 giscus 使用的讨论（根据 categoryId 判断）
		const giscusDiscussions = allDiscussions.filter(
			(discussion: GitHubDiscussion) =>
				discussion.category?.id === giscusConfig.categoryId,
		);

		// 对于每个讨论，获取其评论（支持分页）
		const getCommentsForDiscussion = async (
			discussion: GitHubDiscussion,
		): Promise<GiscusComment[]> => {
			try {
				// 获取讨论的所有评论
				const commentsUrl = `${discussion.comments_url}?per_page=100`;
				const allComments =
					await fetchPaginatedData<GitHubComment>(commentsUrl);

				// 解析讨论标题以获取文章信息（giscus 使用 pathname 作为标题）
				const pathname = discussion.title;
				// 从 pathname 中提取文章 slug
				const slugMatch = pathname.match(/^\/posts\/(.*)\/$/);
				const postSlug = slugMatch ? slugMatch[1] : undefined;

				// 转换评论数据格式
				return allComments
					.filter(
						(comment): comment is GitHubComment => !!comment && !!comment.user,
					) // 过滤掉无效评论并进行类型守卫
					.map((comment) => ({
						id:
							comment.id?.toString() ||
							`comment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
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

		// 并行获取所有讨论的评论
		const commentsArrays = await Promise.all(
			giscusDiscussions.map(getCommentsForDiscussion),
		);

		// 合并所有评论数组
		const comments = commentsArrays.flat();

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
}

// 获取文章信息（标题等）
export async function enrichCommentsWithPostInfo(
	comments: GiscusComment[],
	posts: CollectionEntry<"posts">[],
): Promise<GiscusComment[]> {
	return comments.map((comment) => {
		if (!comment.postSlug) return comment;

		const post = posts.find((p) => p.slug === comment.postSlug);
		if (post) {
			return {
				...comment,
				postTitle: post.data.title,
			};
		}

		return comment;
	});
}
