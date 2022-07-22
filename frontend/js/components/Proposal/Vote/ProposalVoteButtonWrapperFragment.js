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
import useFeatureFlag from '~/utils/hooks/useFeatureFlag';

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
  @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, token: {type: "String"} ) {
    id
    votesLimit
    voteType
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
`;

export const ProposalVoteButtonWrapperFragment = ({
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

  const isTwilioFeatureEnabled = useFeatureFlag('twilio');
  const isProposalSmsVoteFeatureEnabled = useFeatureFlag('proposal_sms_vote');
  const smsVoteEnabled =
    step?.isProposalSmsVoteEnabled && isTwilioFeatureEnabled && isProposalSmsVoteFeatureEnabled;

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

  const hasVoted = (viewer && proposal?.viewerHasVote) ? proposal.viewerHasVote : step?.viewerVotes?.edges?.some(edge => edge?.node?.proposal?.id === proposal.id) ?? false;

  if (proposal && !step?.open) {
    return null;
  }
  if ((!viewer && !smsVoteEnabled) || !proposal) {
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
  const viewerVotesCount = viewer?.proposalVotes ? viewer.proposalVotes.totalCount : 0;
  const popoverId = `vote-tooltip-proposal-${proposal.id}`;

  const hasReachedLimit = (): boolean => {
    const votesLimit = step?.votesLimit;
    if (viewer) {
      return !hasVoted && (votesLimit || false) && (votesLimit || 0) - viewerVotesCount <= 0;
    }
    if (step?.viewerVotes?.totalCount !== undefined) {
      return (
        !hasVoted && (votesLimit || false) && (votesLimit || 0) - step.viewerVotes.totalCount <= 0
      );
    }
    return false;
  };

  if (step?.voteType === 'SIMPLE') {
    return (
      <VoteButtonOverlay
        popoverId={popoverId}
        step={step}
        userHasVote={hasVoted || false}
        hasReachedLimit={hasReachedLimit()}>
        <HoverObserver>
          <ProposalVoteButton
            id={id}
            proposal={proposal}
            currentStep={step}
            disabled={false}
            hasVoted={hasVoted}
          />
        </HoverObserver>
      </VoteButtonOverlay>
    );
  }

  return (
    <VoteButtonOverlay
      popoverId={popoverId}
      step={step}
      userHasVote={hasVoted || false}
      hasReachedLimit={hasReachedLimit()}
      hasUserEnoughCredits={userHasEnoughCredits()}>
      <HoverObserver>
        <ProposalVoteButton
          id={id}
          proposal={proposal}
          currentStep={step}
          className={className}
          hasVoted={hasVoted}
          disabled={!hasVoted && !userHasEnoughCredits()}
        />
      </HoverObserver>
    </VoteButtonOverlay>
  );
};
export default ProposalVoteButtonWrapperFragment;
