import matter from 'gray-matter'
import stringifyObject from 'stringify-object'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { mdxjs } from 'micromark-extension-mdxjs'
import { mdxFromMarkdown } from 'mdast-util-mdx'

// TODO: use next-transpile-modules or similar & convert this file to typescript

/*
 * Inspired by https://github.com/ui-pack/documentation/blob/main/lib/frontmatter.js
 */

function separate(arr, cond) {
  let arr1 = [];
  let arr2 = [];
  arr.forEach(e => cond(e) ? arr1.push(e) : arr2.push(e));
  return [arr1, arr2];
}

function mdxToAst(str) {
  const root = fromMarkdown(str, {
    extensions: [mdxjs()],
    mdastExtensions: [mdxFromMarkdown()],
  });
  return root;
}

function singularMdxToAst(str) {
  // mdxToAst returns a root node
  return mdxToAst(str).children[0];
}

export default () => (tree, file) => {
  const { content, data } = matter(file.value);

  // Remove frontmatter after converting it into JS object on line 60
  if (tree.children[0].type === 'thematicBreak') {
    const firstHeadingIndex = tree.children.findIndex(t => t.type === 'heading')
    if (firstHeadingIndex !== -1) {
      tree.children.splice(0, firstHeadingIndex + 1)
    }
  }

  // Take out esm statements; only apply layout to content
  let [inner, outer] = separate(tree.children, e => e.type !== 'mdxjsEsm');
  tree.children = outer;

  const headingTitleNode = singularMdxToAst(`# ${data.title}`);
  const authorNode = singularMdxToAst(`By ${data.author}.`)

  if (data.subtitle) {
    const subtitleNode = singularMdxToAst(`<em>${data.subtitle}</em>`);
    inner = [headingTitleNode, subtitleNode, authorNode, ...inner];
  } else {
    inner = [headingTitleNode, authorNode, ...inner];
  }

  // Insert parent node with all current children as its children
  const templateNode = singularMdxToAst("<Layout />")
  templateNode.children = inner;
  tree.children.push(templateNode);

  // Prepend with import
  const templateImportNode = singularMdxToAst("import Layout from '../../components/layout'");
  tree.children.unshift(templateImportNode);

  const frontmatterExportNode = singularMdxToAst(`export const frontmatter = ${stringifyObject(data)}`);

  // Expose frontmatter
  tree.children.push(frontmatterExportNode);
}
