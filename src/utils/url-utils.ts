import i18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";
import { encodePathSegment } from "./encoding-utils";

export function pathsEqual(path1: string, path2: string): boolean {
	const normalizePath = (path: string) =>
		path.replace(/^\/|\/$/g, "").toLowerCase();
	return normalizePath(path1) === normalizePath(path2);
}

export function joinUrl(...parts: string[]): string {
	const joined = parts.join("/");
	return joined.replace(/\/+/g, "/");
}

export function getPostUrlBySlug(slug: string): string {
	return url(`/posts/${slug}/`);
}

export function getTagUrl(tag: string): string {
	if (!tag) return url("/archive/tag/");

	const encodedTag = encodePathSegment(tag);
	const tagUrl = `/archive/tag/${encodedTag}/`;
	return url(tagUrl);
}

export function getCategoryUrl(category: string): string {
	if (!category) return url("/archive/category/");

	const trimmedCategory = category.trim();
	if (trimmedCategory === i18n(i18nKey.uncategorized)) {
		return url("/archive/category/uncategorized/");
	}

	const encodedCategory = encodePathSegment(trimmedCategory);
	return url(`/archive/category/${encodedCategory}/`);
}

export function getDir(filePath: string): string {
	const lastSlashIndex = filePath.lastIndexOf("/");
	return lastSlashIndex < 0 ? "/" : filePath.substring(0, lastSlashIndex + 1);
}

export function url(path: string): string {
	const baseUrl = import.meta.env.BASE_URL || "/";
	const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
	const result = joinUrl(baseUrl, normalizedPath);
	return result;
}
