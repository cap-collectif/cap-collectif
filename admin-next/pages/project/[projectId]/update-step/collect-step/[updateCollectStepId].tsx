import React from 'react'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import { useRouter } from 'next/router'
import Layout from '@components/Layout/Layout'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import CollectStepForm from '@components/Steps/CollectStep/CollectStepForm'
import StepCreationSide from '@components/StepCreationSide/StepCreationSide'
import { CollectStepContextProvider } from '../../../../../components/Steps/CollectStep/CollectStepContext'

const UpdateCollectStepWrapper = () => {
  const router = useRouter()
  const projectId = router.query.projectId
  const stepId = router.query.updateCollectStepId
  const [helpMessage, setHelpMessage] = React.useState<string | null>(null)

  if (!projectId || !stepId) return null

  return (
    <Layout navTitle="">
      <Flex direction="row" width="100%" gap={6}>
        <React.Suspense
          fallback={
            <Flex alignItems="center" justifyContent="center" width="100%">
              <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
            </Flex>
          }
        >
          <CollectStepContextProvider>
            <CollectStepForm stepId={stepId as string} setHelpMessage={setHelpMessage} />
          </CollectStepContextProvider>
          <StepCreationSide helpMessage={helpMessage} />
        </React.Suspense>
      </Flex>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default UpdateCollectStepWrapper
