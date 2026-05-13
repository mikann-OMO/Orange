import type MarkdownIt from "markdown-it";
import emojiPacksJson from "../data/emoji-packs.json";

interface BaseEmojiPack {
	name: string;
	items: Record<string, string>;
	source?: string;
}

export interface ImageEmojiPack extends BaseEmojiPack {
	type: "image";
	size?: number;
}

export interface TextEmojiPack extends BaseEmojiPack {
	type: "text";
}

export type EmojiPack = ImageEmojiPack | TextEmojiPack;
export type EmojiPacks = Record<string, EmojiPack>;

export const DEFAULT_EMOJI_SIZE = 28;
export const EMOJI_PAGE_SIZE = 72;
export const emojiPacks = emojiPacksJson as unknown as EmojiPacks;

export function getEmojiPackSize(pack: EmojiPack): number {
	if (pack.type !== "image") return 0;
	return pack.size ?? DEFAULT_EMOJI_SIZE;
}

export function getEmojiPreviewSize(pack: EmojiPack): number {
	if (pack.type !== "image") return 0;
	return Math.min(getEmojiPackSize(pack), 72);
}

export function getGridColumns(pack: EmojiPack): number {
	if (pack.type === "text") return 4;

	const size = getEmojiPreviewSize(pack);
	if (size <= 24) return 10;
	if (size <= 32) return 8;
	if (size <= 48) return 6;
	return 4;
}

export function getEmojiInsertText(packId: string, emojiName: string): string {
	const pack = emojiPacks[packId];
	if (!pack) return "";
	if (pack.type === "text") return pack.items[emojiName] ?? "";
	return `:${packId}_${emojiName}:`;
}

function escapeHtmlAttribute(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll('"', "&quot;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;");
}

function createEmojiImageHtml(
	pack: ImageEmojiPack,
	name: string,
): string | null {
	const src = pack.items[name];
	if (!src) return null;

	const size = getEmojiPackSize(pack);
	const classes = size > 48 ? "emoji emoji-sticker" : "emoji";
	const escapedName = escapeHtmlAttribute(name);
	const escapedSrc = escapeHtmlAttribute(src);

	return `<img class="${classes}" src="${escapedSrc}" alt="${escapedName}" title="${escapedName}" width="${size}" height="${size}" loading="lazy" decoding="async" referrerpolicy="no-referrer">`;
}

export function installEmojiPackRule(md: MarkdownIt): void {
	const emojiRule: Parameters<MarkdownIt["inline"]["ruler"]["before"]>[2] = (
		state,
		silent,
	) => {
		if (state.src.charCodeAt(state.pos) !== 0x3a) return false;

		const end = state.src.indexOf(":", state.pos + 1);
		if (end === -1) return false;

		const rawToken = state.src.slice(state.pos, end + 1);
		const match = rawToken.match(/^:([a-zA-Z0-9_]+)_([^:\n]+):$/);
		if (!match) return false;

		const [, packId, emojiName] = match;
		const pack = emojiPacks[packId];
		const emojiData = pack?.items[emojiName];
		if (!pack || !emojiData) return false;

		if (!silent) {
			if (pack.type === "image") {
				const html = createEmojiImageHtml(pack, emojiName);
				if (!html) return false;

				const token = state.push("html_inline", "", 0);
				token.content = html;
			} else {
				state.pending += emojiData;
			}
		}

		state.pos = end + 1;
		return true;
	};

	md.inline.ruler.before("emphasis", "emoji_pack", emojiRule);
}
