import { useCallback, useEffect } from 'react'
import { useParticipationWorkflow } from './ParticipationWorkflowContext'
import { trackContribution, ContributionTrackingAction } from '~/utils/contributionTracking'

export const useContributionTracking = (step: string, trackView = true) => {
  const { contributionTypeName, contributionId } = useParticipationWorkflow()
  const track = useCallback(
    (action: ContributionTrackingAction) => trackContribution(contributionTypeName, action, step, contributionId),
    [contributionTypeName, contributionId, step],
  )
  useEffect(() => {
    if (trackView) track('step_viewed')
  }, [track, trackView])
  return track
}
