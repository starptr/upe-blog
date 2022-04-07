import matter from 'gray-matter'
import stringifyObject from 'stringify-object'

/*
 * Inspired by https://github.com/ui-pack/documentation/blob/main/lib/frontmatter.js
 */

export default () => (tree, file) => {
  const { content, data } = matter(file.contents);

  // Remove frontmatter after converting it into JS object on line 60
  if (tree.children[0].type === 'thematicBreak') {
    const firstHeadingIndex = tree.children.findIndex(t => t.type === 'heading')
    if (firstHeadingIndex !== -1) {
      tree.children.splice(0, firstHeadingIndex + 1) // TODO: ?
    }
  }

  // Wrap mdx with layout
  tree.children.unshift({
    type: 'import'
  })
}
