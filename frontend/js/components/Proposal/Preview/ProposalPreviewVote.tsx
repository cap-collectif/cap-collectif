import * as React from 'react'
import { graphql, useFragment } from 'react-relay'

import styled from 'styled-components'
import ProposalVoteModal from '../Vote/ProposalVoteModal'
import ProposalVoteButtonWrapperFragment from '../Vote/ProposalVoteButtonWrapperFragment'
import type { ProposalPreviewVote_proposal$key } from '~relay/ProposalPreviewVote_proposal.graphql'
import type { ProposalPreviewVote_step$key } from '~relay/ProposalPreviewVote_step.graphql'
import type { ProposalPreviewVote_viewer$key } from '~relay/ProposalPreviewVote_viewer.graphql'
import { createPortal } from 'react-dom'
import { Box } from '@cap-collectif/ui'
import { Suspense } from 'react'
import ModalSkeleton from '~/components/ParticipationWorkflow/ModalSkeleton'
import ParticipationWorkflowModal from '~/components/ParticipationWorkflow/ParticipationWorkflowModal'

type Props = {
  proposal: ProposalPreviewVote_proposal$key
  step: ProposalPreviewVote_step$key
  viewer: ProposalPreviewVote_viewer$key | null | undefined
  participant: ProposalPreviewVote_participant$key | null | undefined
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
  }
`
const PARTICIPANT_FRAGMENT = graphql`
  fragment ProposalPreviewVote_participant on Participant @argumentDefinitions(stepId: { type: "ID!" }) {
    ...ProposalVoteButtonWrapperFragment_participant @arguments(stepId: $stepId)
  }
`
const PROPOSAL_FRAGMENT = graphql`
  fragment ProposalPreviewVote_proposal on Proposal
  @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, stepId: { type: "ID!" }, token: { type: "String" }) {
    id
    ...ProposalVoteModal_proposal
    ...ProposalVoteButtonWrapperFragment_proposal @arguments(stepId: $stepId, isAuthenticated: $isAuthenticated, token: $token)
  }
`
const STEP_FRAGMENT = graphql`
  fragment ProposalPreviewVote_step on Step
  @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, token: { type: "String" }) {
    id
    ...ProposalVoteModal_step @arguments(token: $token)
    ...ProposalVoteButtonWrapperFragment_step @arguments(token: $token, isAuthenticated: $isAuthenticated)
  }
`
export const ProposalPreviewVote: React.FC<Props> = ({
  viewer: viewerRef,
  step: stepRef,
  proposal: proposalRef,
  usesNewUI,
  disabled,
  participant: participantRef,
}) => {
  const viewer = useFragment(VIEWER_FRAGMENT, viewerRef)
  const participant = useFragment(PARTICIPANT_FRAGMENT, participantRef)
  
  const proposal = useFragment(PROPOSAL_FRAGMENT, proposalRef)
  const step = useFragment(STEP_FRAGMENT, stepRef)

  const [voteId, setVoteId] = React.useState<string | null>(null)
  const [showRequirementsModal, setShowRequirementsModal] = React.useState(false);

  const triggerRequirementsModal = (voteId: string) => {
    setVoteId(voteId);
    setShowRequirementsModal(true);
  }

  if (showRequirementsModal && voteId) {
    return (
      createPortal(
        <Box width="100%" height="100%" position="absolute" top={0} left={0}>
          <Suspense fallback={<ModalSkeleton/>}>
            <ParticipationWorkflowModal stepId={step.id} contributionId={window.btoa(`AbstractVote:${voteId.toString()}`)} />
          </Suspense>
        </Box>,
        document.body
      )
    )
  }

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
        triggerRequirementsModal={triggerRequirementsModal}
        participant={participant}
      />
      {!usesNewUI && (
        <ProposalVoteModal proposal={proposal} step={step} triggerRequirementsModal={triggerRequirementsModal} />
      )}
    </Container>
  )
}
export default ProposalPreviewVote
