import { getStatusesInitialValues } from '@components/BackOffice/Steps/ProposalStep/ProposalStepStatuses'
import { FormValues, StepDurationTypeEnum } from '@components/BackOffice/Steps/SelectStep/SelectStepForm'
import { SelectStepFormQuery$data } from '@relay/SelectStepFormQuery.graphql'
import { getDefaultRequirements } from '../../Requirements/Requirements'
import { EnabledEnum } from '@components/BackOffice/Steps/Shared/PublicationInput'
import { ProposalStepVoteType } from '@relay/CollectStepFormQuery.graphql'
import { voteTypeForTabs } from '../utils'

export type TabsVoteType = Omit<ProposalStepVoteType, 'BUDGET'> | 'ADVANCED'

export const getDefaultValues = (
  step: SelectStepFormQuery$data['step'],
  stepId: string,
  bgColor: string,
): FormValues => {
  const stepDurationType = step?.timeless ? [StepDurationTypeEnum.TIMELESS] : [StepDurationTypeEnum.CUSTOM]
  const stepEnabledType = step?.enabled ? [EnabledEnum.PUBLISHED] : [EnabledEnum.DRAFT]

  return {
    requirementsReason: step?.requirements?.reason ?? '',
    id: stepId,
    label: step?.label ?? '',
    body: step?.body ?? '',
    title: step?.title ?? '',
    allowingProgressSteps: step?.allowingProgressSteps,
    startAt: step?.timeRange?.startAt ?? null,
    endAt: step?.timeRange?.endAt ?? null,
    stepDurationType: {
      labels: stepDurationType,
    },
    form: {
      isGridViewEnabled: step?.form?.isGridViewEnabled ?? false,
      isListViewEnabled: step?.form?.isListViewEnabled ?? false,
      isMapViewEnabled: step?.form?.isMapViewEnabled ?? false,
      // @ts-ignore
      zoomMap: String(step?.form?.zoomMap) || null,
      mapCenter: step?.form?.mapCenter,
      canContact: step?.form?.canContact,
      // @ts-ignore should work wtf relay
      usingAddress: step?.form?.usingAddress,
      usingWebPage: step?.form?.usingWebPage,
      usingFacebook: step?.form?.usingFacebook,
      usingTwitter: step?.form?.usingTwitter,
      usingInstagram: step?.form?.usingInstagram,
      usingYoutube: step?.form?.usingYoutube,
      usingLinkedIn: step?.form?.usingLinkedIn,
    },
    voteType: step?.voteType,
    _voteTypeForTabs: voteTypeForTabs(step),
    votesMin: step?.votesMin,
    votesLimit: step?.votesLimit,
    votesRanking: step?.votesRanking,
    budget: step?.budget,
    voteThreshold: step?.voteThreshold,
    secretBallot: step?.isSecretBallot,
    publishedVoteDate: step?.publishedVoteDate,
    votesHelpText: step?.votesHelpText,
    proposalArchivedTime: step.proposalArchivedTime,
    proposalArchivedUnitTime: step.proposalArchivedUnitTime,
    // @ts-ignore relay lookup
    requirements: getDefaultRequirements(step),
    statuses: getStatusesInitialValues(step?.statuses, bgColor),
    defaultStatus: step?.defaultStatus ? step?.defaultStatus.id : null,
    allowAuthorsToAddNews: step?.allowAuthorsToAddNews,
    defaultSort: step?.defaultSort?.toUpperCase(),
    mainView: {
      labels: [step?.mainView],
    },
    metaDescription: step?.metaDescription || '',
    customCode: step?.customCode || '',
    enabled: {
      labels: stepEnabledType,
    },
  }
}
