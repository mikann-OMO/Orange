import i18nKey from "../i18n/i18nKey.ts";
import { i18n } from "../i18n/translation.ts";
import { encodePathSegment } from "./encoding-utils.ts";

/**
 * Check if two paths are equal, ignoring leading/trailing slashes and case
 */
export function pathsEqual(path1: string, path2: string): boolean {
	// Normalize paths by removing leading/trailing slashes and converting to lowercase
	const normalizePath = (path: string) =>
		path.replace(/^\/|\/$/g, "").toLowerCase();
	return normalizePath(path1) === normalizePath(path2);
}

/**
 * Join URL parts into a single URL string, normalizing slashes
 */
export function joinUrl(...parts: string[]): string {
	const joined = parts.join("/");
	return joined.replace(/\/+/g, "/");
}

/**
 * Generate URL for a post by its slug
 */
export function getPostUrlBySlug(slug: string): string {
	return url(`/posts/${slug}/`);
}

/**
 * Generate URL for a note by its slug
 */
export function getNoteUrlBySlug(slug: string): string {
	return url(`/notes/${slug}/`);
}

/**
 * Generate URL for a tag archive page
 */
export function getTagUrl(tag: string): string {
	if (!tag) return url("/archive/tag/");

	// Use common encoding function
	const encodedTag = encodePathSegment(tag);
	const tagUrl = `/archive/tag/${encodedTag}/`;
	return url(tagUrl);
}

/**
 * Generate URL for a category archive page
 */
export function getCategoryUrl(category: string): string {
	if (!category) return url("/archive/category/");

	const trimmedCategory = category.trim();
	if (trimmedCategory === i18n(i18nKey.uncategorized)) {
		return url("/archive/category/uncategorized/");
	}

	// Use consistent encoding function for categories
	const encodedCategory = encodePathSegment(trimmedCategory);
	return url(`/archive/category/${encodedCategory}/`);
}

/**
 * Get the directory path from a file path
 */
export function getDir(filePath: string): string {
	const lastSlashIndex = filePath.lastIndexOf("/");
	return lastSlashIndex < 0 ? "/" : filePath.substring(0, lastSlashIndex + 1);
}

/**
 * Generate a full URL with the base URL prepended
 */
export function url(path: string): string {
	return joinUrl("", import.meta.env.BASE_URL, path);
}
