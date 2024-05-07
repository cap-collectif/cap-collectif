import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import cn from 'classnames'
import { graphql, useFragment } from 'react-relay'
import ProposalVoteButton from './ProposalVoteButton'
import VoteButtonOverlay from './VoteButtonOverlay'
import LoginOverlay from '../../Utils/NewLoginOverlay'
import type { ProposalVoteButtonWrapperFragment_proposal$key } from '~relay/ProposalVoteButtonWrapperFragment_proposal.graphql'
import type { ProposalVoteButtonWrapperFragment_step$key } from '~relay/ProposalVoteButtonWrapperFragment_step.graphql'
import HoverObserver from '../../Utils/HoverObserver'
import type { ProposalVoteButtonWrapperFragment_viewer$key } from '~relay/ProposalVoteButtonWrapperFragment_viewer.graphql'
import { isInterpellationContextFromProposal } from '~/utils/interpellationLabelHelper'
import useFeatureFlag from '~/utils/hooks/useFeatureFlag'
import VoteButtonUI from '~/components/VoteStep/VoteButtonUI'

type Props = {
  proposal: ProposalVoteButtonWrapperFragment_proposal$key
  viewer: ProposalVoteButtonWrapperFragment_viewer$key | null | undefined
  step: ProposalVoteButtonWrapperFragment_step$key | null | undefined
  id: string
  className?: string
  disabled?: boolean
  usesNewUI?: boolean
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
const PROPOSAL_FRAGMENT = graphql`
  fragment ProposalVoteButtonWrapperFragment_proposal on Proposal
  @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, stepId: { type: "ID!" }) {
    id
    estimation
    votes(stepId: $stepId, first: 0) {
      totalCount
    }
    paper: paperVotesTotalCount(stepId: $stepId)
    viewerHasVote(step: $stepId) @include(if: $isAuthenticated)
    ...interpellationLabelHelper_proposal @relay(mask: false)
    ...ProposalVoteButton_proposal @arguments(stepId: $stepId, isAuthenticated: $isAuthenticated)
  }
`
const STEP_FRAGMENT = graphql`
  fragment ProposalVoteButtonWrapperFragment_step on ProposalStep @argumentDefinitions(token: { type: "String" }) {
    id
    votesLimit
    voteType
    budget
    open
    isProposalSmsVoteEnabled
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
    ...ProposalVoteButton_step
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
  id = '',
  className = '',
  disabled,
  usesNewUI,
}: Props) => {
  const viewer = useFragment(VIEWER_FRAGMENT, viewerRef)
  const proposal = useFragment(PROPOSAL_FRAGMENT, proposalRef)
  const step = useFragment(STEP_FRAGMENT, stepRef)
  const isTwilioFeatureEnabled = useFeatureFlag('twilio')
  const isProposalSmsVoteFeatureEnabled = useFeatureFlag('proposal_sms_vote')
  const smsVoteEnabled = step?.isProposalSmsVoteEnabled && isTwilioFeatureEnabled && isProposalSmsVoteFeatureEnabled

  const voteButtonLabel = isInterpellationContextFromProposal(proposal) ? 'global.support.for' : 'global.vote.for'
  const hasVoted =
    viewer && proposal?.viewerHasVote
      ? proposal.viewerHasVote
      : step?.viewerVotes?.edges?.some(edge => edge?.node?.proposal?.id === proposal.id) ?? false

  if (proposal && !step?.open) {
    return null
  }

  if ((!viewer && !smsVoteEnabled) || !proposal) {
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
            !viewer || !viewer?.proposalVotes,
            proposal?.estimation,
            viewer?.proposalVotes?.creditsLeft,
          )
        }
      >
        <HoverObserver>
          <ProposalVoteButton
            id={id}
            proposal={proposal}
            currentStep={step}
            disabled={false}
            hasVoted={hasVoted}
            usesNewUI={usesNewUI}
          />
        </HoverObserver>
      </VoteButtonOverlay>
    )
  }

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
      hasUserEnoughCredits={userHasEnoughCredits(
        !viewer || !viewer?.proposalVotes,
        proposal.estimation,
        viewer?.proposalVotes?.creditsLeft,
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
            !hasVoted &&
            !userHasEnoughCredits(
              !viewer || !viewer?.proposalVotes,
              proposal.estimation,
              viewer?.proposalVotes?.creditsLeft,
            )
          }
          usesNewUI={usesNewUI}
        />
      </HoverObserver>
    </VoteButtonOverlay>
  )
}
export default ProposalVoteButtonWrapperFragment
