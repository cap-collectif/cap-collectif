import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import cn from 'classnames'
import { graphql, useFragment } from 'react-relay'
import ProposalVoteButton from './ProposalVoteButton'
import VoteButtonOverlay from './VoteButtonOverlay'
import LoginOverlay from '../../Utils/LoginOverlay'
import type { ProposalVoteButtonWrapperFragment_proposal$key } from '~relay/ProposalVoteButtonWrapperFragment_proposal.graphql'
import type { ProposalVoteButtonWrapperFragment_step$key } from '~relay/ProposalVoteButtonWrapperFragment_step.graphql'
import HoverObserver from '../../Utils/HoverObserver'
import type { ProposalVoteButtonWrapperFragment_viewer$key } from '~relay/ProposalVoteButtonWrapperFragment_viewer.graphql'
import { isInterpellationContextFromProposal } from '~/utils/interpellationLabelHelper'
import VoteButtonUI from '~/components/VoteStep/VoteButtonUI'
import {
  ProposalVoteButtonWrapperFragment_participant$key
} from '~relay/ProposalVoteButtonWrapperFragment_participant.graphql'

type Props = {
  proposal: ProposalVoteButtonWrapperFragment_proposal$key
  viewer: ProposalVoteButtonWrapperFragment_viewer$key | null | undefined
  step: ProposalVoteButtonWrapperFragment_step$key | null | undefined
  participant: ProposalVoteButtonWrapperFragment_participant$key | null | undefined
  id: string
  className?: string
  disabled?: boolean
  usesNewUI?: boolean
  triggerRequirementsModal: (voteId: string) => void
}
const VIEWER_FRAGMENT = graphql`
  fragment ProposalVoteButtonWrapperFragment_viewer on User
  @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, stepId: { type: "ID!" }) {
    id
    proposalVotes(stepId: $stepId) @include(if: $isAuthenticated) {
      totalCount
      creditsLeft
    }
  }
`

const PARTICIPANT_FRAGMENT = graphql`
    fragment ProposalVoteButtonWrapperFragment_participant on Participant
    @argumentDefinitions(stepId: { type: "ID!" }) {
        id
        proposalVotes(stepId: $stepId) {
            totalCount
            creditsLeft
        }
    }
`

const PROPOSAL_FRAGMENT = graphql`
  fragment ProposalVoteButtonWrapperFragment_proposal on Proposal
  @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, stepId: { type: "ID!" }, token: { type: "String" }) {
    id
    title
    estimation
    votes(stepId: $stepId, first: 0) {
      totalCount
    }
    paper: paperVotesTotalCount(stepId: $stepId)
    viewerHasVote(step: $stepId) @include(if: $isAuthenticated)
    viewerVote(step: $stepId) @include(if: $isAuthenticated) {
        completionStatus
    }
    contributorVote(step: $stepId, token: $token) {
        completionStatus
    }
    ...interpellationLabelHelper_proposal @relay(mask: false)
    ...ProposalVoteButton_proposal @arguments(stepId: $stepId, isAuthenticated: $isAuthenticated, token: $token)
  }
`
const STEP_FRAGMENT = graphql`
  fragment ProposalVoteButtonWrapperFragment_step on ProposalStep 
  @argumentDefinitions(token: { type: "String" }, isAuthenticated: { type: "Boolean!" }) 
  {
    id
    votesLimit
    voteType
    budget
    open
    viewerVotes(orderBy: { field: POSITION, direction: ASC }, token: $token) {
      totalCount
      edges {
        node {
          proposal {
            id
          }
        }
      }
    }
    ...ProposalVoteButton_step @arguments(isAuthenticated: $isAuthenticated, token: $token)
    ...VoteButtonOverlay_step
  }
`

export const userHasEnoughCredits = (hasNoProposalVotes: boolean, estimation: number, creditsLeft?: number) => {
  if (hasNoProposalVotes) {
    return true
  }

  if (creditsLeft !== null && typeof creditsLeft !== 'undefined' && estimation) {
    return creditsLeft >= estimation
  }

  return true
}

export const hasReachedLimit = (
  isAuthenticated: boolean,
  votesLimit: number,
  hasVoted: boolean,
  viewerVotesCount: number,
  anonymousViewerVotesCount: number,
): boolean => {
  if (isAuthenticated) {
    return !hasVoted && (votesLimit || false) && (votesLimit || 0) - viewerVotesCount <= 0
  }

  if (anonymousViewerVotesCount !== undefined) {
    return !hasVoted && (votesLimit || false) && (votesLimit || 0) - anonymousViewerVotesCount <= 0
  }

  return false
}

export const ProposalVoteButtonWrapperFragment = ({
  viewer: viewerRef,
  proposal: proposalRef,
  step: stepRef,
  participant: participantRef,
  id = '',
  className = '',
  disabled,
  usesNewUI,
  triggerRequirementsModal
}: Props) => {
  const viewer = useFragment(VIEWER_FRAGMENT, viewerRef)
  const proposal = useFragment(PROPOSAL_FRAGMENT, proposalRef)
  const step = useFragment(STEP_FRAGMENT, stepRef)
  const participant = useFragment(PARTICIPANT_FRAGMENT, participantRef)

  const voteButtonLabel = isInterpellationContextFromProposal(proposal) ? 'global.support.for' : 'global.vote.for'
  const hasVoted = viewer ? proposal?.viewerVote?.completionStatus === 'COMPLETED' : proposal?.contributorVote?.completionStatus === 'COMPLETED'

  if (proposal && !step?.open && !usesNewUI) {
    return null
  }

  if (!proposal) {
    return (
      <LoginOverlay>
        {usesNewUI ? (
          <VoteButtonUI
            hasVoted={false}
            disabled={disabled}
            id={id}
            onClick={() => {}}
            totalCount={proposal.votes.totalCount}
            paperVotesTotalCount={proposal.paper}
            title={proposal.title}
          />
        ) : (
          <button type="button" disabled={disabled} id={id} className={cn('btn btn-success mr-10', className)}>
            <i className="cap cap-hand-like-2 mr-5" />
            <FormattedMessage id={voteButtonLabel} />
          </button>
        )}
      </LoginOverlay>
    )
  }

  const viewerVotesCount = viewer?.proposalVotes ? viewer.proposalVotes.totalCount : 0
  const popoverId = `vote-tooltip-proposal-${proposal.id}`

  const creditsLeft = viewer?.proposalVotes?.creditsLeft ?? participant?.proposalVotes?.creditsLeft
  const hasNoProposalVotes = (!viewer || !viewer?.proposalVotes) && (!participant || !participant?.proposalVotes)

  if (step?.voteType === 'SIMPLE') {
    return (
      <VoteButtonOverlay
        popoverId={popoverId}
        step={step}
        userHasVote={hasVoted || false}
        hasReachedLimit={hasReachedLimit(
          !!viewer,
          step?.votesLimit,
          hasVoted,
          viewerVotesCount,
          step?.viewerVotes?.totalCount,
        )}
        hasUserEnoughCredits={
          !step.budget ||
          userHasEnoughCredits(
            hasNoProposalVotes,
            proposal?.estimation,
            creditsLeft,
          )
        }
      >
        <HoverObserver>
          <ProposalVoteButton
            id={id}
            proposal={proposal}
            currentStep={step}
            disabled={disabled}
            hasVoted={hasVoted}
            usesNewUI={usesNewUI}
            triggerRequirementsModal={triggerRequirementsModal}
          />
        </HoverObserver>
      </VoteButtonOverlay>
    )
  }

  return (
    <>
      <VoteButtonOverlay
        popoverId={popoverId}
        step={step}
        userHasVote={hasVoted || false}
        hasReachedLimit={hasReachedLimit(
          !!viewer,
          step?.votesLimit,
          hasVoted,
          viewerVotesCount,
          step?.viewerVotes?.totalCount,
        )}
        hasUserEnoughCredits={userHasEnoughCredits(
          hasNoProposalVotes,
          proposal.estimation,
          creditsLeft,
        )}
      >
        <HoverObserver>
          <ProposalVoteButton
            id={id}
            proposal={proposal}
            currentStep={step}
            className={className}
            hasVoted={hasVoted}
            disabled={
              (!hasVoted &&
                !userHasEnoughCredits(
                  hasNoProposalVotes,
                  proposal.estimation,
                  creditsLeft,
                )) ||
              disabled
            }
            usesNewUI={usesNewUI}
            triggerRequirementsModal={triggerRequirementsModal}
          />
        </HoverObserver>
      </VoteButtonOverlay>
    </>
  )
}
export default ProposalVoteButtonWrapperFragment
