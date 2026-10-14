import * as React from 'react'
import ParticipationWorkflow, {
  CONTRIBUTION_ID_URL_PARAM,
} from '~/components/ParticipationWorkflow/ParticipationWorkflow'
import VocalContributionModal from './VocalContributionModal'
import type { UploadConfig } from './vocalContributionApi'
import { useUrlToast } from '~/utils/hooks/useUrlToast'

export const STEP_ID_URL_PARAM = 'stepId'
const WORKFLOW_URL_PARAM = 'workflow'

type Workflow = {
  stepId: string
  contributionId: string
  shouldTriggerConsentInternalCommunication?: boolean
}

// Same URL parameters as the proposal deposit, so that a reload resumes the participation workflow
const getWorkflowFromUrl = (): Workflow | null => {
  const { searchParams } = new URL(window.location.href)
  const stepId = searchParams.get(STEP_ID_URL_PARAM)
  const contributionId = searchParams.get(CONTRIBUTION_ID_URL_PARAM)
  return searchParams.has(WORKFLOW_URL_PARAM) && stepId && contributionId ? { stepId, contributionId } : null
}

export type Props = UploadConfig

const VocalContribution = (uploadConfig: Props) => {
  useUrlToast()
  const [workflow, setWorkflow] = React.useState<Workflow | null>(getWorkflowFromUrl)

  const startWorkflow = (
    stepId: string,
    contributionId: string,
    shouldTriggerConsentInternalCommunication: boolean,
  ) => {
    const url = new URL(window.location.href)
    url.searchParams.set(WORKFLOW_URL_PARAM, '')
    url.searchParams.set(STEP_ID_URL_PARAM, stepId)
    url.searchParams.set(CONTRIBUTION_ID_URL_PARAM, contributionId)
    window.history.pushState({}, '', url)
    setWorkflow({ stepId, contributionId, shouldTriggerConsentInternalCommunication })
  }

  return (
    <>
      <VocalContributionModal uploadConfig={uploadConfig} onParticipationWorkflowRequired={startWorkflow} />
      {workflow && (
        <ParticipationWorkflow
          stepId={workflow.stepId}
          contributionId={workflow.contributionId}
          shouldTriggerConsentInternalCommunication={workflow.shouldTriggerConsentInternalCommunication}
        />
      )}
    </>
  )
}

export default VocalContribution
