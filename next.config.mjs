import mdxPreprocessor from './lib/mdxPreprocessor.mjs';
import withWithMDX from '@next/mdx';
import remarkMdx from 'remark-mdx';

const withMDX = withWithMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [mdxPreprocessor, remarkMdx],
    rehypePlugins: [],
    providerImportSource: '@mdx-js/react',
  }
})

export default withMDX({
  webpack: (config, options) => {
    //config.module.rules.push({
    //  test: /\.mdx?$/,
    //  use: [
    //    options.defaultLoaders.babel,
    //    {
    //      loader: '@mdx-js/loader',
    //      options: {
    //        providerImportSource: '@mdx-js/react',
    //        remarkPlugins: [mdxPreprocessor],
    //      },
    //    },
    //  ],
    //});

    return config;
  },
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
});
