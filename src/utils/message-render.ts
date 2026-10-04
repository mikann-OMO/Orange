import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import { installEmojiPackRule, loadEmojiPacks } from "./emoji-packs";

const md = new MarkdownIt({
	html: true,
	breaks: true,
	linkify: true,
});
installEmojiPackRule(md);

// 预加载 emoji 数据（不阻塞渲染，加载完成后 renderMessageContent 即可解析表情）
export const emojiPacksPromise = loadEmojiPacks();

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

// 渲染留言内容：先 Markdown 转 HTML，再用 sanitize-html 清洗，防止 XSS
export function renderMessageContent(text: string): string {
	const withSpoilers = text.replace(/\|\|(.*?)\|\|/g, '<span class="spoiler">$1</span>');

	const rawHtml = md.render(withSpoilers);

	return sanitizeHtml(rawHtml, sanitizeOptions);
}
