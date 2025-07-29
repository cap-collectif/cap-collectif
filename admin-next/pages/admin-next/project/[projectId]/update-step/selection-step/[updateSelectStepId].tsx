import React from 'react'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import { useRouter } from 'next/router'
import Layout from '@components/BackOffice/Layout/Layout'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import SelectStepForm from '@components/BackOffice/Steps/SelectStep/SelectStepForm'
import StepCreationSide from '@components/BackOffice/StepCreationSide/StepCreationSide'
import { SelectionStepContextProvider } from '@components/BackOffice/Steps/SelectStep/SelectionStepContext'

const UpdateSelectStepWrapper = () => {
  const router = useRouter()
  const projectId = router.query.projectId
  const stepId = router.query.updateSelectStepId
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
          <SelectionStepContextProvider>
            <SelectStepForm stepId={stepId as string} setHelpMessage={setHelpMessage} />
          </SelectionStepContextProvider>
        </React.Suspense>
        <StepCreationSide helpMessage={helpMessage} />
      </Flex>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default UpdateSelectStepWrapper
