// @flow
// Legacy : https://github.com/cap-collectif/platform/issues/13828
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import cn from 'classnames';
import { graphql, createFragmentContainer } from 'react-relay';
import ProposalVoteButton from './ProposalVoteButton';
import VoteButtonOverlay from './VoteButtonOverlay';
import LoginOverlay from '../../Utils/LoginOverlay';
import type { ProposalVoteButtonWrapperFragmentLegacy_proposal } from '~relay/ProposalVoteButtonWrapperFragmentLegacy_proposal.graphql';
import type { ProposalVoteButtonWrapperFragmentLegacy_step } from '~relay/ProposalVoteButtonWrapperFragmentLegacy_step.graphql';
import HoverObserver from '../../Utils/HoverObserver';
import type { ProposalVoteButtonWrapperFragmentLegacy_viewer } from '~relay/ProposalVoteButtonWrapperFragmentLegacy_viewer.graphql';
import { isInterpellationContextFromProposal } from '~/utils/interpellationLabelHelper';

type Props = {
  proposal: ProposalVoteButtonWrapperFragmentLegacy_proposal,
  viewer: ?ProposalVoteButtonWrapperFragmentLegacy_viewer,
  step: ?ProposalVoteButtonWrapperFragmentLegacy_step,
  id: string,
  className: string,
  disabled?: boolean,
};

export class ProposalVoteButtonWrapperFragmentLegacy extends React.Component<Props> {
  static defaultProps = {
    id: '',
    className: '',
  };

  userHasEnoughCredits = () => {
    const { viewer, proposal } = this.props;
    if (!viewer || !viewer.proposalVotes) {
      return true;
    }
    const { creditsLeft } = viewer.proposalVotes;
    if (creditsLeft !== null && typeof creditsLeft !== 'undefined' && proposal.estimation) {
      return creditsLeft >= proposal.estimation;
    }
    return true;
  };

  render() {
    const { id, viewer, step, proposal, className, disabled } = this.props;
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
        hasUserEnoughCredits={this.userHasEnoughCredits()}>
        <HoverObserver>
          <ProposalVoteButton
            id={id}
            proposal={proposal}
            currentStep={step}
            user={viewer}
            className={className}
            disabled={!proposal.viewerHasVote && !this.userHasEnoughCredits()}
          />
        </HoverObserver>
      </VoteButtonOverlay>
    );
  }
}

export default createFragmentContainer(ProposalVoteButtonWrapperFragmentLegacy, {
  viewer: graphql`
    fragment ProposalVoteButtonWrapperFragmentLegacy_viewer on User
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, stepId: { type: "ID!" }) {
      id
      proposalVotes(stepId: $stepId) @include(if: $isAuthenticated) {
        totalCount
        creditsLeft
      }
    }
  `,
  proposal: graphql`
    fragment ProposalVoteButtonWrapperFragmentLegacy_proposal on Proposal
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }, stepId: { type: "ID!" }) {
      id
      estimation
      viewerHasVote(step: $stepId) @include(if: $isAuthenticated)
      ...interpellationLabelHelper_proposal @relay(mask: false)
      ...ProposalVoteButton_proposal @arguments(stepId: $stepId, isAuthenticated: $isAuthenticated)
    }
  `,

  step: graphql`
    fragment ProposalVoteButtonWrapperFragmentLegacy_step on ProposalStep
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      title
      votesLimit
      voteType
      open
      votesRanking
      viewerVotes(orderBy: { field: POSITION, direction: ASC }) @include(if: $isAuthenticated) {
        edges {
          node {
            id
            anonymous
          }
        }
      }
      ...VoteButtonOverlay_step
    }
  `,
});
