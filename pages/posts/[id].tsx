import Layout from '../../components/layout'
import { getAllPostIds, getPostData, PostData, PostId } from '../../lib/posts'
import Head from 'next/head'
import Date from '../../components/date'
import utilStyles from '../../styles/utils.module.css'
import { GetStaticProps, GetStaticPaths } from 'next'

export default function Post({
  postData
}: {
  postData: PostData
}) {
  return (
    <Layout>
      <Head>
        <title>{postData.title}</title>
      </Head>
      <article>
        <h1 className={utilStyles.headingXl}>{postData.title}</h1>
        <div className={utilStyles.lightText}>
          <Date dateString={postData.publishDate} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
      </article>
    </Layout>
  )
}

function transformPostIdsToPathParams(postIds: PostId[]): { params: PostId }[] {
  return postIds.map(postId => ({ params: postId }));
}

export const getStaticPaths: GetStaticPaths = async () => {
  const postIds: PostId[] = getAllPostIds()
  const paths = transformPostIdsToPathParams(postIds);
  return {
    paths,
    fallback: false
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const postData = await getPostData(params.id as string)
  return {
    props: {
      postData
    }
  }
}
