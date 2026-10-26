import type { StepUserVotesType } from './VoteStepUserInfos'

export const getTitleValue = (
  type: StepUserVotesType,
  isValidated: boolean,
  votesMin: number | null,
  votesLimit: number | null,
  voteProgress: number,
) => {
  if (type === 'min' || ((type === 'minMax' || type === 'minMaxRanking' || type === 'budgetMinMax') && !isValidated)) {
    return (votesMin ?? 0) - voteProgress
  }
  if (type === 'max' || type === 'maxRanking' || type === 'budgetMinMax') return (votesLimit ?? 0) - voteProgress
  return undefined
}
