import { CapUIIcon, Icon, Text, CapUIFontWeight, Button, Tooltip, Tag } from '@cap-collectif/ui'
import { graphql, useFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import { useCallback, useEffect, useState } from 'react'
import { VoteButton_proposal$key } from '@relay/VoteButton_proposal.graphql'
import { VoteButton_step$key } from '@relay/VoteButton_step.graphql'
import type { AddProposalVoteMutation$data } from '@relay/AddProposalVoteMutation.graphql'
import type { AddProposalSmsVoteMutation$data } from '@relay/AddProposalSmsVoteMutation.graphql'
import AddProposalVoteMutation from '@mutations/AddProposalVoteMutation'
import AddProposalSmsVoteMutation from '@mutations/AddProposalSmsVoteMutation'
import RemoveProposalVoteMutation from '@mutations/RemoveProposalVoteMutation'
import RemoveProposalSmsVoteMutation from '@mutations/RemoveProposalSmsVoteMutation'
import { dangerToast, mutationErrorToast } from '@shared/utils/toasts'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import CookieMonster from '@shared/utils/CookieMonster'
import { getVoteButtonIcon } from '@shared/utils/getVoteButtonIcon'

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
    form {
      objectType
    }
    viewerVotes {
      totalCount
      creditsLeft
      edges {
        node {
          id
          completionStatus
          ranking
          proposal {
            id
          }
        }
      }
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
  const isAuthenticated = viewerSession != null
  const [anonymousVote, setAnonymousVote] = useState<{ id: string; completionStatus: string } | null | undefined>(
    undefined,
  )
  const [isLoading, setIsLoading] = useState(false)

  const persistedAnonymousVote = step.viewerVotes?.edges?.find(edge => edge.node.proposal.id === proposal.id)?.node
  const currentVote = isAuthenticated
    ? proposal.viewerVote
    : anonymousVote === undefined
    ? persistedAnonymousVote
    : anonymousVote
  const hasVote = isAuthenticated ? proposal.viewerHasVote : currentVote !== null && currentVote !== undefined
  const hasIncompleteVote = currentVote?.completionStatus === 'MISSING_REQUIREMENTS'
  const votesMin = step.votesMin ?? 0
  const viewerVotesCount = step.viewerVotes?.totalCount ?? 0

  // When the viewer has a valid counted vote, show at least 1.
  // This handles the case where the server vote count update is async (message queue)
  // and the count hasn't been reflected yet after a page reload.
  const isViewerVoteAccounted = hasVote && !hasIncompleteVote && (votesMin === 0 || viewerVotesCount >= votesMin)
  const numericVotesCount = proposal.votes?.totalCount ?? 0
  const votesCount = numericVotesCount + proposal.paperVotesTotalCount
  const displayedNumericVotesCount = numericVotesCount
  const isSupport = step.actionButtonLabel === 'SUPPORT'
  const numericLabelId = isSupport ? 'numeric-supports-count' : 'numeric-votes-count'
  const paperLabelId = isSupport ? 'paper-supports-count' : 'paper-votes-count'
  const displayedCount = isViewerVoteAccounted ? Math.max(votesCount, 1) : votesCount

  useEffect(() => {
    setAnonymousVote(undefined)
  }, [step.viewerVotes])

  const addVote = useCallback(async () => {
    if (!step?.id || !proposal?.id) return
    try {
      let payload:
        | AddProposalVoteMutation$data['addProposalVote']
        | AddProposalSmsVoteMutation$data['addProposalSmsVote']
      if (isAuthenticated) {
        const response = await AddProposalVoteMutation.commit(
          {
            input: { proposalId: proposal.id, stepId: step.id },
            stepId: step.id,
          },
          true,
        )
        payload = response.addProposalVote
      } else {
        const response = await AddProposalSmsVoteMutation.commit({
          input: {
            proposalId: proposal.id,
            stepId: step.id,
            token: CookieMonster.getParticipantCookie(),
          },
          stepId: step.id,
        })
        payload = response.addProposalSmsVote
        if (payload?.participantToken) CookieMonster.addParticipantCookie(payload.participantToken)
      }

      const errorCode = payload?.errorCode
      if (errorCode) {
        if (errorCode === 'NOT_ENOUGH_CREDITS') {
          dangerToast(
            intl.formatMessage(
              {
                id: 'front.vote.error.budget-exceeded',
                defaultMessage:
                  'Cette {contributionType, select, QUESTION {question} OPINION {proposition (consultation)} other {proposition}} dépasse le budget restant de votre panier. Retirez une ou plusieurs {contributionType, select, QUESTION {questions} OPINION {propositions (consultation)} other {propositions}} pour pouvoir l’ajouter.',
              },
              { contributionType: step.form?.objectType, voteAction: step.actionButtonLabel },
            ),
          )
          return
        }

        if (errorCode === 'VOTE_LIMIT_REACHED') {
          dangerToast(
            intl.formatMessage(
              {
                id: 'front.vote.error.limit-reached',
                defaultMessage:
                  'Vous avez atteint le nombre maximal de {voteAction, select, SUPPORT {soutiens} other {votes}} autorisés. Retirez un {voteAction, select, SUPPORT {soutien} other {vote}} pour {voteAction, select, SUPPORT {soutenir} other {voter pour}} cette {contributionType, select, QUESTION {question} OPINION {proposition (consultation)} other {proposition}}.',
              },
              { contributionType: step.form?.objectType, voteAction: step.actionButtonLabel },
            ),
          )
          return
        }

        mutationErrorToast(intl)
        return
      }

      const hasNowReachedVotesMin = votesMin === 0 || step.viewerVotes?.totalCount + 1 >= votesMin
      const createdVote = payload?.vote
      if (!isAuthenticated && createdVote) setAnonymousVote(createdVote)
      // The mutation is the source of truth: open the workflow only when the created vote is incomplete.
      if (createdVote?.completionStatus === 'MISSING_REQUIREMENTS' && hasNowReachedVotesMin) {
        triggerRequirementModal(createdVote.id)
        return
      }
    } catch {
      mutationErrorToast(intl)
    }
  }, [
    isAuthenticated,
    step?.id,
    step.form?.objectType,
    step.actionButtonLabel,
    proposal?.id,
    intl,
    votesMin,
    step.viewerVotes?.totalCount,
    triggerRequirementModal,
  ])

  const deleteVote = useCallback(async () => {
    if (!step?.id || !proposal?.id) return
    if (!isAuthenticated) {
      const token = CookieMonster.getParticipantCookie()
      if (!token) {
        mutationErrorToast(intl)
        return
      }
      try {
        const response = await RemoveProposalSmsVoteMutation.commit({
          input: { proposalId: proposal.id, stepId: step.id, token },
          stepId: step.id,
        })
        if (response.removeProposalSmsVote?.errorCode) {
          mutationErrorToast(intl)
          return
        }
        setAnonymousVote(null)
      } catch (error) {
        mutationErrorToast(intl)
      }
      return
    }

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
        },
      )
    } catch {
      mutationErrorToast(intl)
    }
  }, [isAuthenticated, step?.id, proposal?.id, proposal.viewerVote?.id, intl])

  const onClick = useCallback(async () => {
    if (isLoading) return

    // User has an incomplete vote from a previous session, re-trigger requirements
    if (hasIncompleteVote && currentVote) {
      triggerRequirementModal(currentVote.id)
      return
    }

    setIsLoading(true)

    try {
      if (hasVote) {
        await deleteVote()
      } else {
        await addVote()
      }
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasIncompleteVote, currentVote, hasVote, addVote, deleteVote, triggerRequirementModal])

  const votedTextId = isSupport ? 'front.proposal.supported' : 'front.proposal.voted-for'
  const voteTextId = isSupport ? 'global.support.for' : 'global.vote.for'
  const tooltipLabel =
    displayedCount > 0 ? (
      <>
        {intl.formatMessage({ id: numericLabelId }, { num: displayedNumericVotesCount })}
        {proposal.paperVotesTotalCount > 0 && (
          <>
            <br />
            {intl.formatMessage({ id: paperLabelId }, { num: proposal.paperVotesTotalCount })}
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
      id={`proposal-vote-btn-${proposal.id}`}
      onClick={onClick}
      variant={hasVote ? 'primary' : 'secondary'}
      aria-label={intl.formatMessage({ id: hasVote ? 'global.delete' : 'global.add' })}
      height="32px"
      leftIcon={voteIcon}
      disabled={isLoading}
      isLoading={isLoading}
      flexShrink={0}
    >
      <Text fontWeight={CapUIFontWeight.Semibold} whiteSpace="nowrap">
        {step.canDisplayBallot ? (
          <>
            {displayedCount}
            {step.voteThreshold ? ` / ${step.voteThreshold}` : ''}
          </>
        ) : (
          intl.formatMessage({ id: hasVote ? votedTextId : voteTextId })
        )}
      </Text>
    </Button>
  )

  if (!tooltipLabel) return buttonContent

  return <Tooltip label={tooltipLabel}>{buttonContent}</Tooltip>
}

export default VoteButton
