import * as React from 'react'
import Layout from '@components/BackOffice/Layout/Layout'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import useUrlState from '@hooks/useUrlState'
import VideoFormWrapper, { VideoFormWrapperWithData } from '@components/BackOffice/Videos/VideoFormWrapper'

const Video = (): React.JSX.Element => {
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
        {idFromUrl ? <VideoFormWrapperWithData videoId={idFromUrl} /> : <VideoFormWrapper />}
      </React.Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default Video
