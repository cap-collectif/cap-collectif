import React from 'react'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import { useRouter } from 'next/router'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import Layout from '@components/Layout/Layout'
import useFeatureFlag from '@hooks/useFeatureFlag'
import CreateStepPage from '@components/CreateStep/CreateStepPage'

const CreateStepWrapper = () => {
  const router = useRouter()
  const projectId = router.query.projectId
  const isNewProjectCreateEnabled = useFeatureFlag('unstable__new_create_project')

  if (!isNewProjectCreateEnabled) {
    throw new Error('You need to enable unstable__new_create_project feature to access this page.')
  }

  if (!projectId) return null

  return (
    <Layout navTitle="">
      <React.Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <CreateStepPage projectId={projectId as string} />
      </React.Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default CreateStepWrapper
