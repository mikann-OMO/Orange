import { describe, expect, it } from "vitest";
import { buildTocTree } from "../../src/utils/toc";

describe("buildTocTree", () => {
	it("should build standard H1, H2, H3 hierarchy", () => {
		const headings = [
			{ depth: 1, slug: "intro", text: "Introduction #" },
			{ depth: 2, slug: "features", text: "Features" },
			{ depth: 3, slug: "fast", text: "Fast" },
			{ depth: 2, slug: "usage", text: "Usage" },
			{ depth: 1, slug: "conclusion", text: "Conclusion" },
		];

		const tree = buildTocTree(headings);
		expect(tree).toHaveLength(2);
		expect(tree[0].id).toBe("intro");
		expect(tree[0].text).toBe("Introduction");
		expect(tree[0].num).toBe(1);
		expect(tree[0].children).toHaveLength(2);
		expect(tree[0].children[0].id).toBe("features");
		expect(tree[0].children[0].children).toHaveLength(1);
		expect(tree[0].children[0].children[0].id).toBe("fast");
		expect(tree[0].children[1].id).toBe("usage");
		expect(tree[1].id).toBe("conclusion");
		expect(tree[1].num).toBe(2);
	});

	it("should support headings starting from H2 without H1", () => {
		const headings = [
			{ depth: 2, slug: "sec-1", text: "Section 1" },
			{ depth: 3, slug: "sec-1-1", text: "Sub 1.1" },
			{ depth: 2, slug: "sec-2", text: "Section 2" },
		];

		const tree = buildTocTree(headings);
		expect(tree).toHaveLength(2);
		expect(tree[0].id).toBe("sec-1");
		expect(tree[0].num).toBe(1);
		expect(tree[0].children).toHaveLength(1);
		expect(tree[0].children[0].id).toBe("sec-1-1");
		expect(tree[1].id).toBe("sec-2");
		expect(tree[1].num).toBe(2);
	});

	it("should filter by minDepth and maxDepth options", () => {
		const headings = [
			{ depth: 1, slug: "h1", text: "Title" },
			{ depth: 2, slug: "h2", text: "H2" },
			{ depth: 4, slug: "h4", text: "H4" },
		];

		const tree = buildTocTree(headings, { minDepth: 2, maxDepth: 3 });
		expect(tree).toHaveLength(1);
		expect(tree[0].id).toBe("h2");
	});
});
