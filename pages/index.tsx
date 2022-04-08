import Layout from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import { getSortedPostsData, PostMetadata } from '../lib/posts'
import Link from 'next/link'
import Date from '../components/date'
import { GetStaticProps } from 'next'

export default function Home({
  allPostsData
}: {
  allPostsData: PostMetadata[]
}) {
  return (
    <Layout home>
      <section className={utilStyles.headingMd}>
        <p><em>This website is in Beta!</em></p>
      </section>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        <ul className={utilStyles.list}>
          {allPostsData.map((postMetadata) => (
            <li className={utilStyles.listItem} key={postMetadata.id}>
              <Link href={`/posts/${postMetadata.id}`}>
                <a>{postMetadata.title}</a>
              </Link>
              <br />
                {postMetadata.publishDate
                ? <small className={utilStyles.lightText}>
                    <Date dateString={postMetadata.publishDate} />
                  </small>
                : <></>}
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const allPostsData = getSortedPostsData();
  return {
    props: {
      allPostsData
    }
  };
}
