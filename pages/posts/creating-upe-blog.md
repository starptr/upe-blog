---
title: "Creating Our In-House Own Blogging Platform"
author: "Yuto Nishida"
publishDate: "2022-04-08"
---

Ok so by the time you read this, I finished writing code for the basic blogging platform plus some alpha. This is a technical article that (I hope) serves as a crash-course for understanding how this codebase works.

## Overview
This platform is made using the [NextJS framework](https://nextjs.org/). Essentially, the relative path of almost every file in `/pages` represent the [slug](https://developer.mozilla.org/en-US/docs/Glossary/Slug) of a page that can be accessed. Exceptions include:

- Files under `/pages/api`, which are API endpoints written in Node.js (all of the code runs server-side)
- Files that start with an underscore like `/pages/_app.tsx` and `/pages/_documents.tsx`, which are special page components that are used for every page on the website

Almost all other files should represent a particular page on the website (and should return a React functional (page) component). But wait! What about the funny `/pages/posts/*.md` files?

### Markdown (MDX) files
#### What are MDX files?
Imagine if you could write markdown, but also include JSX components within it, call arbitrary javascript expressions (inside braces), and import and export arbitrary ESM modules. MDX is an **X**tension of markdown that lets you do exactly that! So for example, if you have a cool components `<Clock />` that displays an interactive clock, you could simply write `<Clock />` in your MDX file and the markdown documents will intuitively display your components alongside all of the other text in your article!

#### MDX and NextJS
By default, NextJS doesn't understand MDX files. But because of the way I set up webpack in `next.config.mjs`, you can think of all MDX files as JSX with syntactic sugar. For example, the content of the MDX file is equivalent to the default export functional page component that all TSX files under `/pages` has. The frontmatter is equivalent to an exported object called `frontmatter` that has key-value pairs implied by the format of the frontmatter. Wait, what's the frontmatter you ask?

#### What's the frontmatter?
At the beginning of each article in `/pages/posts`, there are a few lines that look like this:

```yaml
---
title: "Title of this Article"
author: "Full Name"
publishDate: "2020-01-01"
---
```

This is called the frontmatter, and it's useful for a few reasons. First, it serves as the single source of metadata of the article. The title of the article is generated from the frontmatter (so don't create a level-1 heading for the title at the top of your MDX documents!) and so on. Second, since the data is parser-friendly, there's no need to search through the entire MDX document just to find the `publishDate`. This is especially important when multiple pages need this information, such as when both the home page and the article page need to know the published date of the article to correctly sort them and display the dates. But how does NextJS parse the frontmatter?

## What I Did (Or Rather, What the Code Does)
Earlier I actually lied. I said that you can think of all MDX files as JDX with syntactic sugar. While this is true for the most part (and all you really need to know to write MDX documents to be published on this platform), the MDX document really goes under a transformation to "become" a JDX file. Now, what exactly is this transformation?

### My Custom MDX Preprocessor
If you take a look at `/lib/mdxPreprocessor.mjs`, you'll notice that a [HOF](https://en.wikipedia.org/wiki/Higher-order_function) is the default export, which is imported into `next.config.mjs` and passed in as a [remark plugin](https://github.com/remarkjs/remark/blob/main/doc/plugins.md). The HOF is (part of) the magic that handles the MDX-to-JSX transformation. Although most of the work is done by [remark-mdx](https://www.npmjs.com/package/remark-mdx) and [@next/mdx](https://www.npmjs.com/package/@next/mdx), there a few important things that the custom "preprocessor" does to make sure the MDX articles look the way they do.

#### Wrapping the Content in `<Layout />`
If I let the MDX [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree) pass through, then none of the styling for the website would be applied. To apply the styles so that the website looks decent and uniform across all pages, we need to wrap the MDX content in `<Layout />`, a functional component defined in `/components/layout.tsx`. However, this only styles the overall layout of the website, like the UPE logo and the width of the article. Custom styling for the content itself is done through the `<MDXProvider />` component, which wraps the entire website in `/pages/_app.tsx`. The styling is specified in `/components/MDXComponents.tsx` and `/styles/content.module.css`.

#### Constructing Custom Parts for the AST
Unfortunately, there doesn't seem to be an actual vertex constructor for the markdown AST. So I used [mdast-util-from-markdown](https://github.com/syntax-tree/mdast-util-from-markdown), [mdast-util-mdx](https://github.com/syntax-tree/mdast-util-mdx), and [micromark-extension-mdxjs](https://github.com/micromark/micromark-extension-mdxjs) to construct a small AST from a string containing the MDX I want to insert, eg.

```jsx
<Layout />
```

and modified the children of the generated vertex. And finally, we have an MDX-to-JSX transformer that programatically takes the frontmatter and inserts it into the resulting JSX. Hooray!

## Next Steps
Provided that we actually end up using this project, there's still tons of work to be done before we get back all of the features that were already on Medium, plus the features we originally wanted to have in the first place. (For posterity: if you're helping maintain this project, this list might be outdated.) Here is a list of things that I was using (\*is using, at the time I write this) that are still to be done:

- GitHub-flavored markdown features (although I'm not sure what they are)
  - Likely a low-hanging fruit, since I suspect you just have to add the GFM MDX plugin to the Next config
- Code block syntax highlighting
- LaTeX
  - Also likely a low-hanging fruit, for the same reason as GFM
- Make adding images not suck, probably by adding support for third-party image hosts
  - No, using `<img />` tags directly is cheating since that will cause [Cumulative Layout Shifting](https://web.dev/cls/)
- Parse the article markdown docs into printable PDFs
  - This will probably require displaying the text into letter-page-sized rectangles and using something like [jsPDF](https://github.com/parallax/jsPDF) to generate PDFs from them.
