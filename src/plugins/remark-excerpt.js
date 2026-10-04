// biome-ignore lint/suspicious/noShadowRestrictedNames: toString is imported from mdast-util-to-string and intentionally shadows the global
import { toString } from "mdast-util-to-string";

export function remarkExcerpt() {
	return (tree, { data }) => {
		let excerpt = "";
		for (const node of tree.children) {
			if (node.type !== "paragraph") {
				continue;
			}
			excerpt = toString(node);
			break;
		}
		data.astro.frontmatter.excerpt = excerpt;
	};
}
