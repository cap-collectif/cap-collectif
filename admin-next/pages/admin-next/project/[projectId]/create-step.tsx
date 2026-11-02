import React from 'react'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import { useRouter } from 'next/router'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import Layout from '@components/BackOffice/Layout/Layout'
import CreateStepPage from '@components/BackOffice/CreateStep/CreateStepPage'

const CreateStepWrapper = () => {
  const router = useRouter()
  const projectId = router.query.projectId
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
