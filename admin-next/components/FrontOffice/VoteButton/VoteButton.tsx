import { CapUIIcon, Icon, Text, CapUIFontWeight, Button, Tooltip, Tag } from '@cap-collectif/ui'
import { graphql, useFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import { useCallback } from 'react'
import { VoteButton_proposal$key } from '@relay/VoteButton_proposal.graphql'
import { VoteButton_step$key } from '@relay/VoteButton_step.graphql'
import AddProposalVoteMutation from '@mutations/AddProposalVoteMutation'
import RemoveProposalVoteMutation from '@mutations/RemoveProposalVoteMutation'
import { mutationErrorToast } from '@shared/utils/toasts'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'

type Props = {
  proposal: VoteButton_proposal$key
  step: VoteButton_step$key
  disabled?: boolean
  triggerRequirementModal: (id: string) => void
}

const PROPOSAL_FRAGMENT = graphql`
  fragment VoteButton_proposal on Proposal @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
    id
    estimation
    viewerHasVote(step: $stepId) @include(if: $isAuthenticated)
    viewerVote(step: $stepId) {
      id
      completionStatus
    }
    votes {
      totalCount
    }
    paperVotesTotalCount
  }
`

const STEP_FRAGMENT = graphql`
  fragment VoteButton_step on ProposalStep @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
    id
    votesMin
    votesLimit
    budget
    open
    viewerVotes {
      totalCount
      creditsLeft
    }
    voteThreshold
    canDisplayBallot
    requirements @include(if: $isAuthenticated) {
      viewerMeetsTheRequirements
    }
  }
`

/**
 * VoteButton component for voting on proposals.
 *
 * Handles vote creation/deletion with support for:
 * - Vote limits (votesLimit, budget)
 * - Minimum votes threshold (votesMin)
 * - Requirements validation (viewerMeetsTheRequirements)
 *
 * When requirements are not met after reaching votesMin, displays an alert.
 * TODO: Integrate ParticipationWorkflowModal when migrated to admin-next.
 */
export const VoteButton: React.FC<Props> = ({ proposal: proposalRef, step: stepRef, triggerRequirementModal }) => {
  const step = useFragment(STEP_FRAGMENT, stepRef)
  const proposal = useFragment(PROPOSAL_FRAGMENT, proposalRef)
  const { viewerSession } = useAppContext()
  const intl = useIntl()

  const hasIncompleteVote = proposal.viewerVote?.completionStatus === 'MISSING_REQUIREMENTS'
  const votesMin = step.votesMin ?? 0
  const viewerMeetsRequirements = step.requirements?.viewerMeetsTheRequirements
  const votesCount = proposal.votes?.totalCount ?? 0

  const viewerVotesCount = step.viewerVotes?.totalCount ?? 0
  const hasReachedVotesLimit = step.votesLimit != null && viewerVotesCount >= step.votesLimit && !proposal.viewerHasVote

  const addVote = useCallback(async () => {
    if (!step?.id || !proposal?.id) return
    try {
      const response = await AddProposalVoteMutation.commit(
        {
          input: {
            proposalId: proposal.id,
            stepId: step.id,
          },
          stepId: step.id,
        },
        viewerSession != null,
        {
          proposalId: proposal.id,
          stepId: step.id,
          currentVotesCount: votesCount,
          currentViewerVotesCount: step.viewerVotes?.totalCount ?? 0,
          currentCreditsLeft: step.viewerVotes?.creditsLeft ?? null,
          proposalEstimation: proposal.estimation ?? null,
          votesMin: step.votesMin ?? null,
        },
      )

      const errorCode = response?.addProposalVote?.errorCode
      if (errorCode) {
        mutationErrorToast(intl)
        return
      }

      const hasNowReachedVotesMin = votesMin === 0 || step.viewerVotes?.totalCount + 1 >= votesMin

      // If requirements not met and reached minimum votes, trigger requirements flow
      if (!viewerMeetsRequirements && hasNowReachedVotesMin && response?.addProposalVote?.vote?.id) {
        triggerRequirementModal(response.addProposalVote.vote.id)
        return
      }
    } catch (error) {
      mutationErrorToast(intl)
    }
  }, [step?.id, proposal?.id, intl, viewerMeetsRequirements, votesMin, step.viewerVotes?.totalCount, viewerSession])

  const deleteVote = useCallback(async () => {
    if (!step?.id || !proposal?.id) return
    try {
      await RemoveProposalVoteMutation.commit(
        {
          input: {
            proposalId: proposal.id,
            stepId: step.id,
          },
          stepId: step.id,
        },
        {
          proposalId: proposal.id,
          stepId: step.id,
          voteId: proposal.viewerVote?.id ?? null,
          currentVotesCount: votesCount,
          currentViewerVotesCount: step.viewerVotes?.totalCount ?? 0,
          currentCreditsLeft: step.viewerVotes?.creditsLeft ?? null,
          proposalEstimation: proposal.estimation ?? null,
          votesMin: step.votesMin ?? null,
        },
      )
    } catch (error) {
      mutationErrorToast(intl)
    }
  }, [
    step?.id,
    proposal?.id,
    proposal.viewerVote?.id,
    intl,
    votesCount,
    step.viewerVotes?.totalCount,
    step.viewerVotes?.creditsLeft,
    proposal.estimation,
  ])

  const onClick = useCallback(async () => {
    // User has an incomplete vote from a previous session, re-trigger requirements
    if (hasIncompleteVote) {
      triggerRequirementModal(proposal.viewerVote.id)
      return
    }

    if (proposal.viewerHasVote) {
      await deleteVote()
    } else {
      await addVote()
    }
  }, [hasIncompleteVote, proposal.viewerHasVote, addVote, deleteVote, triggerRequirementModal])

  const tooltipLabel =
    votesCount > 0
      ? `${proposal.votes?.totalCount - proposal.paperVotesTotalCount} ${intl.formatMessage(
          { id: 'numeric-votes' },
          { num: proposal.votes?.totalCount - proposal.paperVotesTotalCount },
        )}${
          proposal.paperVotesTotalCount > 0
            ? `<br />${proposal.paperVotesTotalCount} ${intl.formatMessage(
                { id: 'paper-votes-count' },
                { num: proposal.paperVotesTotalCount },
              )}`
            : ''
        }`
      : null

  // Step closed: show vote count only
  if (!step.open) {
    const tagContent = (
      <Tag variantColor="infoGray" transparent>
        <Icon name={CapUIIcon.ThumbUpO} />
        <Text>
          {step.canDisplayBallot
            ? votesCount
            : intl.formatMessage({ id: proposal.viewerHasVote ? 'front.proposal.voted-for' : 'global.vote.for' })}
        </Text>
      </Tag>
    )

    if (!tooltipLabel) return tagContent

    return <Tooltip label={tooltipLabel}>{tagContent}</Tooltip>
  }

  const buttonContent = (
    <Button
      onClick={onClick}
      variant={proposal.viewerHasVote ? 'primary' : 'secondary'}
      aria-label={intl.formatMessage({ id: proposal.viewerHasVote ? 'global.delete' : 'global.add' })}
      height="32px"
      leftIcon={CapUIIcon.ThumbUp}
      disabled={hasReachedVotesLimit}
    >
      <Text fontWeight={CapUIFontWeight.Semibold}>
        {step.canDisplayBallot ? (
          <>
            {votesCount}
            {step.voteThreshold ? ` / ${step.voteThreshold}` : ''}
          </>
        ) : (
          intl.formatMessage({ id: proposal.viewerHasVote ? 'front.proposal.voted-for' : 'global.vote.for' })
        )}
      </Text>
    </Button>
  )

  if (!tooltipLabel) return buttonContent

  return <Tooltip label={tooltipLabel}>{buttonContent}</Tooltip>
}

export default VoteButton
