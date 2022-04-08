import '../styles/global.css'
import { AppProps } from 'next/app'
import MDXComponents from '../components/MDXComponents'
import { MDXProvider } from '@mdx-js/react'

export default function App({ Component, pageProps }: AppProps) {
  return <MDXProvider components={MDXComponents}>
    <Component {...pageProps} />
  </MDXProvider>;
}
