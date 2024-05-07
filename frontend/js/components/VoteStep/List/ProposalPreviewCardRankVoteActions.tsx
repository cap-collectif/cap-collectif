import * as React from 'react'
import { RankButton } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import ResetCss from '~/utils/ResetCss'
import UpdateProposalVotesMutation from '~/mutations/UpdateProposalVotesMutation'
import { useSelector } from 'react-redux'
import { GlobalState } from '~/types'
import { VoteStepEvent, dispatchEvent } from '../utils'

type Props = {
  stepId: string
  proposalId: string
  points: number
  votes: {
    id: string
    anonymous: boolean
    proposalId: string
  }[]
}

export const ProposalPreviewCardRankVoteActions = ({ points, votes, proposalId, stepId }: Props) => {
  const intl = useIntl()
  const isAuthenticated = useSelector((state: GlobalState) => state.user.user !== null)

  const onClick = (direction: 'up' | 'down') => {
    const index = votes.findIndex(vote => vote.proposalId === proposalId)

    if ((!index && direction === 'up') || (index === votes.length - 1 && direction === 'down')) return

    const currentVote = votes.find(vote => vote.proposalId === proposalId)
    const votesSorted = votes.filter(vote => vote.proposalId !== proposalId)

    votesSorted.splice(direction === 'up' ? index - 1 : index + 1, 0, currentVote)

    votes.map(v =>
      dispatchEvent(VoteStepEvent.AnimateCard, {
        proposalId: v.proposalId,
      }),
    )

    return UpdateProposalVotesMutation.commit(
      {
        input: {
          step: stepId,
          votes: votesSorted
            .filter(voteFilter => voteFilter.id !== null)
            .map(v => ({
              id: v.id,
              anonymous: v.anonymous,
            })),
        },
        stepId,
        isAuthenticated,
        token: null,
      },
      {
        id: null,
        position: -1,
        isVoteRanking: true,
      },
    )
  }

  return (
    <ResetCss>
      <RankButton
        onLeftIconClick={() => onClick('up')}
        onRightIconClick={() => onClick('down')}
        label={intl.formatMessage({ id: 'vote_step.points' }, { num: points })}
      />
    </ResetCss>
  )
}
export default ProposalPreviewCardRankVoteActions
