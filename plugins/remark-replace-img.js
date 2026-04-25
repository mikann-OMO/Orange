export default function remarkReplaceImg() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName === 'img') {
        node.tagName = 'ImageWrapper';
        node.properties = {
          src: node.properties.src,
          alt: node.properties.alt || '',
          class: node.properties.class || '',
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
