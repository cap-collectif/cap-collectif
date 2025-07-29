import * as React from 'react'
import Layout from '@components/BackOffice/Layout/Layout'
import { Flex, Spinner, CapUIIconSize } from '@cap-collectif/ui'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import PostFormWrapper, { PostFormWrapperWithData } from '@components/BackOffice/Posts/PostFormWrapper'
import useUrlState from '@hooks/useUrlState'

const Post = (): React.JSX.Element => {
  const [idFromUrl] = useUrlState('id', '')

  return (
    <Layout navTitle={''}>
      <React.Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        {idFromUrl ? <PostFormWrapperWithData postId={idFromUrl} /> : <PostFormWrapper postId={null} />}
      </React.Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default Post
