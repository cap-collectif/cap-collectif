// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import ModalSkeleton from '~/components/ParticipationWorkflow/ModalSkeleton'
import { Box } from '@cap-collectif/ui'

const ParticipationWorkflowModal = lazy(
  () =>
    import(
      /* webpackChunkName: "RequirementsPage" */
      '~/components/ParticipationWorkflow/ParticipationWorkflowModal'
      ),
)

type Props = {
  stepId: string
  contributionId: string
}

const RequirementsPageApp: React.FC<Props> = ({stepId, contributionId}) => {
  document.getElementsByTagName('html')[0].style.fontSize = '14px'
  return (
    <Providers designSystem resetCSS={false}>
      <Box width="100%" height="100vh" position="absolute" top={0} left={0}>
        <Suspense fallback={<ModalSkeleton/>}>
          <ParticipationWorkflowModal stepId={stepId} contributionId={contributionId} />
        </Suspense>
      </Box>
    </Providers>
  )
}

export default RequirementsPageApp
