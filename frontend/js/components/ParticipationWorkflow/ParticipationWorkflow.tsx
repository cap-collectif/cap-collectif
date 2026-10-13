import { Box } from '@cap-collectif/ui'
import { FC, Suspense } from 'react'
import { createPortal } from 'react-dom'
import ModalSkeleton from './ModalSkeleton'
import ParticipationWorkflowModal, { Props } from './ParticipationWorkflowModal'

export const CONTRIBUTION_ID_URL_PARAM = 'contributionId'

const ParticipationWorkflow: FC<Partial<Props>> = ({ stepId, contributionId }) => {
  return createPortal(
    <Box width="100%" height="100vh" position="absolute" top={0} left={0}>
      <Suspense fallback={<ModalSkeleton />}>
        <ParticipationWorkflowModal stepId={stepId} contributionId={contributionId} />
      </Suspense>
    </Box>,
    document.body,
  )
}
export default ParticipationWorkflow
