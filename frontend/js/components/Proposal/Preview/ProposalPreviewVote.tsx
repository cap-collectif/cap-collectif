import * as React from 'react'
import { graphql, useFragment } from 'react-relay'

import styled from 'styled-components'
import ProposalVoteModal from '../Vote/ProposalVoteModal'
import ProposalVoteButtonWrapperFragment from '../Vote/ProposalVoteButtonWrapperFragment'
import type { ProposalPreviewVote_proposal$key } from '~relay/ProposalPreviewVote_proposal.graphql'
import type { ProposalPreviewVote_step$key } from '~relay/ProposalPreviewVote_step.graphql'
import type { ProposalPreviewVote_viewer$key } from '~relay/ProposalPreviewVote_viewer.graphql'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import ProposalSmsVoteModal from '~/components/Proposal/Vote/ProposalSmsVoteModal'

type Props = {
  proposal: ProposalPreviewVote_proposal$key
  step: ProposalPreviewVote_step$key
  viewer: ProposalPreviewVote_viewer$key | null | undefined
  usesNewUI?: boolean
  disabled?: boolean
}
const Container = styled.span`
  /** Boostrap for now until "Epurer" ticket */
  .proposal__button__vote.active:hover {
    background-color: #dc3545;
    border-color: #dc3545;
  }
`
const VIEWER_FRAGMENT = graphql`
  fragment ProposalPreviewVote_viewer on User @argumentDefinitions(stepId: { type: "ID!" }) {
    ...ProposalVoteButtonWrapperFragment_viewer @arguments(isAuthenticated: $isAuthenticated, stepId: $stepId)
    ...ProposalVoteModal_viewer
  }
`
const PROPOSAL_FRAGMENT = graphql`
  fragment ProposalPreviewVote_proposal on Proposal
  @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, stepId: { type: "ID!" }) {
    id
    ...ProposalSmsVoteModal_proposal
    ...ProposalVoteModal_proposal
    ...ProposalVoteButtonWrapperFragment_proposal @arguments(stepId: $stepId, isAuthenticated: $isAuthenticated)
  }
`
const STEP_FRAGMENT = graphql`
  fragment ProposalPreviewVote_step on Step
  @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, token: { type: "String" }) {
    ... on ProposalStep {
      isProposalSmsVoteEnabled
    }
    ...ProposalSmsVoteModal_step @arguments(token: $token)
    ...ProposalVoteModal_step @arguments(isAuthenticated: $isAuthenticated, token: $token)
    ...ProposalVoteButtonWrapperFragment_step @arguments(token: $token)
  }
`
export const ProposalPreviewVote: React.FC<Props> = ({
  viewer: viewerRef,
  step: stepRef,
  proposal: proposalRef,
  usesNewUI,
  disabled,
}) => {
  const viewer = useFragment(VIEWER_FRAGMENT, viewerRef)
  const proposal = useFragment(PROPOSAL_FRAGMENT, proposalRef)
  const step = useFragment(STEP_FRAGMENT, stepRef)
  const isTwilioFeatureEnabled = useFeatureFlag('twilio')
  const isProposalSmsVoteFeatureEnabled = useFeatureFlag('proposal_sms_vote')
  const smsVoteEnabled = step.isProposalSmsVoteEnabled && isTwilioFeatureEnabled && isProposalSmsVoteFeatureEnabled

  return (
    <Container>
      <ProposalVoteButtonWrapperFragment
        proposal={proposal}
        step={step}
        viewer={viewer}
        id={`proposal-vote-btn-${proposal.id}`}
        className="proposal__preview__vote mr-15"
        usesNewUI={usesNewUI}
        disabled={disabled}
      />
      {viewer && !usesNewUI && <ProposalVoteModal proposal={proposal} step={step} viewer={viewer} />}
      {!viewer && smsVoteEnabled && <ProposalSmsVoteModal proposal={proposal} step={step} />}
    </Container>
  )
}
export default ProposalPreviewVote
