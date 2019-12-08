export type Tree = {
  key: string;
  children: Tree[];
  parent: Tree | null;
};

export function printTree(tree: Tree, indent = 0) {
  console.log(`${Array(indent + 1).join("   ")}|__${tree.key}`);
  tree.children.forEach(function(node) {
    printTree(node, indent + 1);
  });
}
