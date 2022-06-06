// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import cn from 'classnames';
import { graphql, useFragment } from 'react-relay';
import ProposalVoteButton from './ProposalVoteButton';
import VoteButtonOverlay from './VoteButtonOverlay';
import LoginOverlay from '../../Utils/NewLoginOverlay';
import type { ProposalVoteButtonWrapperFragment_proposal$key } from '~relay/ProposalVoteButtonWrapperFragment_proposal.graphql';
import type { ProposalVoteButtonWrapperFragment_step$key } from '~relay/ProposalVoteButtonWrapperFragment_step.graphql';
import HoverObserver from '../../Utils/HoverObserver';
import type { ProposalVoteButtonWrapperFragment_viewer$key } from '~relay/ProposalVoteButtonWrapperFragment_viewer.graphql';
import { isInterpellationContextFromProposal } from '~/utils/interpellationLabelHelper';

type Props = {
  proposal: ProposalVoteButtonWrapperFragment_proposal$key,
  viewer: ?ProposalVoteButtonWrapperFragment_viewer$key,
  step: ?ProposalVoteButtonWrapperFragment_step$key,
  id: string,
  className?: string,
  disabled?: boolean,
};

const VIEWER_FRAGMENT = graphql`
  fragment ProposalVoteButtonWrapperFragment_viewer on User
  @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, stepId: { type: "ID!" }) {
    id
    proposalVotes(stepId: $stepId) @include(if: $isAuthenticated) {
      totalCount
      creditsLeft
    }
  }
`;
const PROPOSAL_FRAGMENT = graphql`
  fragment ProposalVoteButtonWrapperFragment_proposal on Proposal
  @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, stepId: { type: "ID!" }) {
    id
    estimation
    viewerHasVote(step: $stepId) @include(if: $isAuthenticated)
    ...interpellationLabelHelper_proposal @relay(mask: false)
    ...ProposalVoteButton_proposal @arguments(stepId: $stepId, isAuthenticated: $isAuthenticated)
  }
`;
const STEP_FRAGMENT = graphql`
  fragment ProposalVoteButtonWrapperFragment_step on ProposalStep
  @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
    id
    votesLimit
    voteType
    open
    ...ProposalVoteButton_step
    ...VoteButtonOverlay_step
  }
`;

const ProposalVoteButtonWrapperFragment = ({
  viewer: viewerRef,
  proposal: proposalRef,
  step: stepRef,
  id = '',
  className = '',
  disabled,
}: Props) => {
  const viewer = useFragment(VIEWER_FRAGMENT, viewerRef);
  const proposal = useFragment(PROPOSAL_FRAGMENT, proposalRef);
  const step = useFragment(STEP_FRAGMENT, stepRef);

  const userHasEnoughCredits = () => {
    if (!viewer || !viewer.proposalVotes) {
      return true;
    }
    const { creditsLeft } = viewer.proposalVotes;
    if (creditsLeft !== null && typeof creditsLeft !== 'undefined' && proposal.estimation) {
      return creditsLeft >= proposal.estimation;
    }
    return true;
  };
  const voteButtonLabel = isInterpellationContextFromProposal(proposal)
    ? 'global.support.for'
    : 'global.vote.for';

  if (proposal && !step?.open) {
    return null;
  }
  if (!viewer || !proposal) {
    return (
      <LoginOverlay>
        <button
          type="button"
          disabled={disabled}
          id={id}
          className={cn('btn btn-success mr-10', className)}>
          <i className="cap cap-hand-like-2 mr-5" />
          <FormattedMessage id={voteButtonLabel} />
        </button>
      </LoginOverlay>
    );
  }
  const viewerVotesCount = viewer.proposalVotes ? viewer.proposalVotes.totalCount : 0;
  const popoverId = `vote-tooltip-proposal-${proposal.id}`;
  if (step?.voteType === 'SIMPLE') {
    return (
      <VoteButtonOverlay
        popoverId={popoverId}
        step={step}
        userHasVote={proposal.viewerHasVote || false}
        hasReachedLimit={
          !proposal.viewerHasVote &&
          (step.votesLimit || false) &&
          (step.votesLimit || 0) - viewerVotesCount <= 0
        }>
        <HoverObserver>
          <ProposalVoteButton
            id={id}
            proposal={proposal}
            currentStep={step}
            user={viewer}
            disabled={false}
          />
        </HoverObserver>
      </VoteButtonOverlay>
    );
  }

  return (
    <VoteButtonOverlay
      popoverId={popoverId}
      step={step}
      userHasVote={proposal.viewerHasVote || false}
      hasReachedLimit={
        (step?.votesLimit || false) && (step?.votesLimit || 0) - viewerVotesCount <= 0
      }
      hasUserEnoughCredits={userHasEnoughCredits()}>
      <HoverObserver>
        <ProposalVoteButton
          id={id}
          proposal={proposal}
          currentStep={step}
          user={viewer}
          className={className}
          disabled={!proposal.viewerHasVote && !userHasEnoughCredits()}
        />
      </HoverObserver>
    </VoteButtonOverlay>
  );
};
export default ProposalVoteButtonWrapperFragment;
