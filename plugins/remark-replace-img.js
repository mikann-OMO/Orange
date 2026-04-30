export default function remarkReplaceImg() {
	let imgCount = 0;
	return (tree) => {
		visit(tree, "element", (node) => {
			if (node.tagName === "img") {
				imgCount++;
				// 前3张图片使用 eager 加载，后续使用 lazy 加载
				const loading = imgCount <= 3 ? "eager" : "lazy";
				node.tagName = "ImageWrapper";
				node.properties = {
					src: node.properties.src,
					alt: node.properties.alt || "",
					class: node.properties.class || "",
					loading: loading,
				};
			}
		});
	};
}

function visit(tree, type, callback) {
	if (tree.type === type) {
		callback(tree);
	}
	if (tree.children) {
		tree.children.forEach((child) => visit(child, type, callback));
	}
}
