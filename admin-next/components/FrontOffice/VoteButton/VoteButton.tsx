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

// Converts GraphQL VoteButtonIcon enum value (SCREAMING_SNAKE_CASE) to the matching CapUIIcon key (PascalCase)
const getVoteButtonIcon = (icon: string | null | undefined): CapUIIcon => {
  if (!icon) return CapUIIcon.ThumbUp
  const pascalCase = icon
    .split('_')
    .map(w => w[0] + w.slice(1).toLowerCase())
    .join('')
  return (CapUIIcon as Record<string, CapUIIcon>)[pascalCase] ?? CapUIIcon.ThumbUp
}

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
    votes(stepId: $stepId, first: 0) {
      totalCount
      totalPointsCount
    }
    paperVotesTotalCount(stepId: $stepId)
    paperVotesTotalPointsCount(stepId: $stepId)
  }
`

const STEP_FRAGMENT = graphql`
  fragment VoteButton_step on ProposalStep @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
    id
    votesMin
    votesLimit
    votesRanking
    budget
    open
    viewerVotes {
      totalCount
      creditsLeft
    }
    voteThreshold
    canDisplayBallot
    voteButtonIcon
    actionButtonLabel
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
  const viewerVotesCount = step.viewerVotes?.totalCount ?? 0

  // When the viewer has a valid counted vote, show at least 1.
  // This handles the case where the server vote count update is async (message queue)
  // and the count hasn't been reflected yet after a page reload.
  const isViewerVoteAccounted =
    !!proposal.viewerHasVote && !hasIncompleteVote && (votesMin === 0 || viewerVotesCount >= votesMin)
  const numericVotesCount = proposal.votes?.totalCount ?? 0
  const votesCount = numericVotesCount + proposal.paperVotesTotalCount
  const numericPointsCount = proposal.votes?.totalPointsCount ?? 0
  const pointsCount = numericPointsCount + proposal.paperVotesTotalPointsCount
  const isRankedVote = step.votesRanking
  const isSupport = step.actionButtonLabel === 'SUPPORT'
  const numericDisplayCount = isRankedVote ? numericPointsCount : numericVotesCount
  const paperDisplayCount = isRankedVote ? proposal.paperVotesTotalPointsCount : proposal.paperVotesTotalCount
  const numericLabelId = isRankedVote ? 'numeric-points-count' : isSupport ? 'numeric-supports-count' : 'numeric-votes-count'
  const paperLabelId = isRankedVote ? 'paper-points-count' : isSupport ? 'paper-supports-count' : 'paper-votes-count'
  const displayedCount = isRankedVote ? pointsCount : isViewerVoteAccounted ? Math.max(votesCount, 1) : votesCount
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
      )

      const errorCode = response?.addProposalVote?.errorCode
      if (errorCode) {
        mutationErrorToast(intl)
        return
      }

      const hasNowReachedVotesMin = votesMin === 0 || step.viewerVotes?.totalCount + 1 >= votesMin
      const createdVote = response?.addProposalVote?.vote

      // The mutation is the source of truth: open the workflow only when the created vote is incomplete.
      if (createdVote?.completionStatus === 'MISSING_REQUIREMENTS' && hasNowReachedVotesMin) {
        triggerRequirementModal(createdVote.id)
        return
      }
    } catch (error) {
      mutationErrorToast(intl)
    }
  }, [step?.id, proposal?.id, intl, votesMin, step.viewerVotes?.totalCount, viewerSession, triggerRequirementModal])

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
          currentVotesCount: numericVotesCount,
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
    numericVotesCount,
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

  const votedTextId = isSupport ? 'front.proposal.supported' : 'front.proposal.voted-for'
  const voteTextId = isSupport ? 'global.support.for' : 'global.vote.for'
  const tooltipLabel =
    displayedCount > 0 ? (
      <>
        {intl.formatMessage({ id: numericLabelId }, { num: numericDisplayCount })}
        {paperDisplayCount > 0 && (
          <>
            <br />
            {intl.formatMessage({ id: paperLabelId }, { num: paperDisplayCount })}
          </>
        )}
      </>
    ) : null

  const voteIcon = getVoteButtonIcon(step.voteButtonIcon)

  // Step closed: show vote count only
  if (!step.open) {
    const tagContent = (
      <Tag variantColor="infoGray" transparent>
        <Icon name={voteIcon} />
        <Text>
          {step.canDisplayBallot
            ? displayedCount
            : intl.formatMessage({ id: proposal.viewerHasVote ? votedTextId : voteTextId })}
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
      leftIcon={voteIcon}
      disabled={hasReachedVotesLimit}
    >
      <Text fontWeight={CapUIFontWeight.Semibold}>
        {step.canDisplayBallot ? (
          <>
            {displayedCount}
            {step.voteThreshold ? ` / ${step.voteThreshold}` : ''}
          </>
        ) : (
          intl.formatMessage({ id: proposal.viewerHasVote ? votedTextId : voteTextId })
        )}
      </Text>
    </Button>
  )

  if (!tooltipLabel) return buttonContent

  return <Tooltip label={tooltipLabel}>{buttonContent}</Tooltip>
}

export default VoteButton
