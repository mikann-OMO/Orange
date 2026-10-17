import type { MarkdownHeading } from "astro";

export interface TocNode {
	id: string;
	text: string;
	children: TocNode[];
	num?: number;
}

export interface TocOptions {
	minDepth?: number;
	maxDepth?: number;
	numbered?: boolean;
}

export function buildTocTree(headings: MarkdownHeading[], options: TocOptions = {}): TocNode[] {
	const { minDepth = 1, maxDepth = 6, numbered = true } = options;

	const filtered = headings.filter((h) => h.depth >= minDepth && h.depth <= maxDepth);
	const clean = (t: string) => t.replace(/\s*#\s*$/, "").trim();

	let idx = 0;
	const rootNodes: TocNode[] = [];
	const stack: { node: TocNode; depth: number }[] = [];

	for (const h of filtered) {
		const node: TocNode = { id: h.slug, text: clean(h.text), children: [] };

		while (stack.length > 0 && stack[stack.length - 1].depth >= h.depth) {
			stack.pop();
		}

		if (stack.length === 0) {
			if (numbered) {
				idx++;
				node.num = idx;
			}
			rootNodes.push(node);
		} else {
			stack[stack.length - 1].node.children.push(node);
		}

		stack.push({ node, depth: h.depth });
	}

	return rootNodes;
}
