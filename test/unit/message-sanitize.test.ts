import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import { describe, expect, it } from "vitest";

// 与 MessageItem.svelte 中 renderContent 使用的配置保持一致（不含 emoji 规则，
// 因为 emoji 规则不参与 XSS 清洗）。若后续抽取共用工具，请同步更新此处。
const md = new MarkdownIt({ html: true, breaks: true, linkify: true });

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

function render(text: string): string {
	const withSpoilers = text.replace(/\|\|(.*?)\|\|/g, '<span class="spoiler">$1</span>');
	return sanitizeHtml(md.render(withSpoilers), sanitizeOptions);
}

describe("留言内容 Markdown 渲染与 XSS 清洗", () => {
	it("移除 <script> 标签及其内容", () => {
		const out = render('<script>alert("xss")</script>');
		expect(out).not.toContain("<script");
		expect(out).not.toContain("alert");
	});

	it("移除图片的 onerror 事件属性", () => {
		const out = render('<img src="x.png" onerror="alert(1)">');
		expect(out).not.toContain("onerror");
		expect(out).toContain('src="x.png"');
	});

	it("移除 javascript: 协议的链接", () => {
		// 用原始 HTML 直接测 sanitize-html 层（markdown 链接语法 [x](javascript:..) 已在 markdown-it 层被拦截）
		const out = render('<a href="javascript:alert(1)">click</a>');
		expect(out).not.toContain("javascript:");
		expect(out).toContain("click");
	});

	it("移除 data: 协议的图片地址", () => {
		const out = render("![x](data:image/png;base64,AAAA)");
		expect(out).not.toContain("data:image");
		expect(out).not.toContain("base64");
	});

	it("移除链接上的 onclick，但保留安全的 https 链接", () => {
		const out = render('<a href="https://ok.com" onclick="alert(1)">link</a>');
		expect(out).not.toContain("onclick");
		expect(out).toContain("https://ok.com");
	});

	it("保留常规 Markdown 内容（加粗、行内代码、标题）", () => {
		const out = render("**bold** `code`\n\n# title");
		expect(out).toContain("<strong>");
		expect(out).toContain("<code>");
		expect(out).toContain("<h1>");
	});

	it("保留安全的外部链接", () => {
		const out = render("[示例](https://example.com)");
		expect(out).toContain("https://example.com");
	});

	it("保留隐藏内容（spoiler）标记", () => {
		const out = render("||secret||");
		expect(out).toContain("spoiler");
		expect(out).toContain("secret");
	});
});
