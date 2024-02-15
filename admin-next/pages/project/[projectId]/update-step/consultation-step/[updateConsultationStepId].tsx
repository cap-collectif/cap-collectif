import React from 'react'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import { useRouter } from 'next/router'
import Layout from '@components/Layout/Layout'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import ConsultationStepForm from '@components/Steps/ConsultationStep/ConsultationStepForm'
import { ConsultationStepContextProvider } from '../../../../../components/Steps/ConsultationStep/ConsultationStepContext'
import StepCreationSide from '@components/StepCreationSide/StepCreationSide'

const UpdateConsultationStepWrapper = () => {
  const router = useRouter()
  const projectId = router.query.projectId
  const stepId = router.query.updateConsultationStepId
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
          <ConsultationStepContextProvider>
            <ConsultationStepForm stepId={stepId as string} setHelpMessage={setHelpMessage} />
          </ConsultationStepContextProvider>
          <StepCreationSide helpMessage={helpMessage} />
        </React.Suspense>
      </Flex>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default UpdateConsultationStepWrapper
