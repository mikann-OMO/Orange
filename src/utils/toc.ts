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

export function buildTocTree(
	headings: MarkdownHeading[],
	options: TocOptions = {},
): TocNode[] {
	const { minDepth = 1, maxDepth = 6, numbered = true } = options;

	const filtered = headings.filter(
		(h) => h.depth >= minDepth && h.depth <= maxDepth,
	);
	const clean = (t: string) => t.replace(/\s*#\s*$/, "").trim();

	let idx = 0;
	const level1: TocNode[] = [];
	let l1: TocNode | null = null;
	let l2: TocNode | null = null;
	let l3: TocNode | null = null;
	let l4: TocNode | null = null;
	let l5: TocNode | null = null;

	for (const h of filtered) {
		const node: TocNode = { id: h.slug, text: clean(h.text), children: [] };

		if (h.depth === 1) {
			if (numbered) {
				idx++;
				node.num = idx;
			}
			level1.push(node);
			l1 = node;
			l2 = null;
			l3 = null;
			l4 = null;
			l5 = null;
		} else if (h.depth === 2) {
			const parent =
				l1 ?? (level1.length > 0 ? level1[level1.length - 1] : null);
			if (parent) {
				parent.children.push(node);
			}
			l2 = node;
			l3 = null;
			l4 = null;
			l5 = null;
		} else if (h.depth === 3) {
			const parent = l2 ?? l1;
			if (parent) {
				parent.children.push(node);
			}
			l3 = node;
			l4 = null;
			l5 = null;
		} else if (h.depth === 4) {
			const parent = l3 ?? l2 ?? l1;
			if (parent) {
				parent.children.push(node);
			}
			l4 = node;
			l5 = null;
		} else if (h.depth === 5) {
			const parent = l4 ?? l3 ?? l2 ?? l1;
			if (parent) {
				parent.children.push(node);
			}
			l5 = node;
		} else if (h.depth === 6) {
			const parent = l5 ?? l4 ?? l3 ?? l2 ?? l1;
			if (parent) {
				parent.children.push(node);
			}
		}
	}

	return level1;
}
