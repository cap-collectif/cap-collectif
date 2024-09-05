import { CollectStepFormQuery$data } from '@relay/CollectStepFormQuery.graphql'
import { SelectStepFormQuery$data } from '@relay/SelectStepFormQuery.graphql'
import { FormValues as SelectFormValues } from './SelectStep/SelectStepForm'
import { FormValues as CollectFormValues } from './CollectStep/CollectStepForm'

export const voteTypeForTabs = (step: SelectStepFormQuery$data['step'] | CollectStepFormQuery$data['step']) => {
  switch (step?.voteType) {
    case 'DISABLED':
      return 'DISABLED'
    case 'BUDGET':
      return 'ADVANCED'
    case 'SIMPLE':
      return isAdvancedVoteOfTypeSimple(step)

    default:
      return 'SIMPLE'
  }
}

const isAdvancedVoteOfTypeSimple = (step: SelectStepFormQuery$data['step'] | CollectStepFormQuery$data['step']) => {
  return !step.budget &&
    !step?.voteThreshold &&
    !step?.isSecretBallot &&
    !step?.votesRanking &&
    !step?.votesMin &&
    !step?.votesLimit
    ? 'SIMPLE'
    : 'ADVANCED'
}

export const getVoteParameterInput = ({ _voteTypeForTabs, ...values }: SelectFormValues | CollectFormValues) => {
  const isAdvanced = _voteTypeForTabs === 'ADVANCED'
  const hasBudgetToggle = values.budget !== null && values.budget !== undefined
  return {
    voteType: !isAdvanced ? _voteTypeForTabs : hasBudgetToggle ? 'BUDGET' : 'SIMPLE',
    budget: isAdvanced && hasBudgetToggle ? parseInt(String(values.budget)) : null,
    votesHelpText: isAdvanced ? values.votesHelpText : null,
    votesMin: isAdvanced && values.votesMin ? parseInt(String(values.votesMin)) : null,
    votesLimit: isAdvanced && values.votesLimit ? parseInt(String(values.votesLimit)) : null,
    votesRanking: isAdvanced ? values.votesRanking ?? false : false,
    voteThreshold: isAdvanced && values.voteThreshold ? parseInt(String(values.voteThreshold)) : null,
    secretBallot: isAdvanced ? values.secretBallot : false,
    publishedVoteDate: isAdvanced ? values.publishedVoteDate : null,
    proposalArchivedTime: isAdvanced ? parseInt(String(values.proposalArchivedTime)) : 0,
    proposalArchivedUnitTime: isAdvanced ? values.proposalArchivedUnitTime : 'MONTHS',
  }
}
