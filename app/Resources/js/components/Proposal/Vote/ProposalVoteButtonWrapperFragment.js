// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import ProposalVoteButton from './ProposalVoteButton';
import VoteButtonOverlay from './VoteButtonOverlay';
import LoginOverlay from '../../Utils/LoginOverlay';
import type { ProposalVoteButtonWrapperFragment_proposal } from '~relay/ProposalVoteButtonWrapperFragment_proposal.graphql';
import type { ProposalVoteButtonWrapperFragment_step } from '~relay/ProposalVoteButtonWrapperFragment_step.graphql';
import HoverObserver from '../../Utils/HoverObserver';
import type { ProposalVoteButtonWrapperFragment_viewer } from '~relay/ProposalVoteButtonWrapperFragment_viewer.graphql';

type Props = {
  proposal: ProposalVoteButtonWrapperFragment_proposal,
  viewer: ?ProposalVoteButtonWrapperFragment_viewer,
  step: ProposalVoteButtonWrapperFragment_step,
  id: string,
  className: string,
};

export class ProposalVoteButtonWrapperFragment extends React.Component<Props> {
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
    const { id, viewer, step, proposal, className } = this.props;

    if (!step.open) {
      return null;
    }

    if (!viewer) {
      return (
        <LoginOverlay>
          <Button id={id} bsStyle="success" className={`${className} mr-10`}>
            <FormattedMessage id="proposal.vote.add" />
          </Button>
        </LoginOverlay>
      );
    }
    const viewerVotesCount = viewer.proposalVotes ? viewer.proposalVotes.totalCount : 0;
    const popoverId = `vote-tooltip-proposal-${proposal.id}`;
    if (step.voteType === 'SIMPLE') {
      return (
        /* $FlowFixMe */
        <VoteButtonOverlay
          popoverId={popoverId}
          step={step}
          userHasVote={proposal.viewerHasVote || false}
          hasReachedLimit={
            !proposal.viewerHasVote && step.votesLimit && step.votesLimit - viewerVotesCount <= 0
          }>
          <HoverObserver>
            {/* $FlowFixMe */}
            <ProposalVoteButton
              id={id}
              proposal={proposal}
              step={step}
              user={viewer}
              disabled={false}
            />
          </HoverObserver>
        </VoteButtonOverlay>
      );
    }

    return (
      /* $FlowFixMe */
      <VoteButtonOverlay
        popoverId={popoverId}
        step={step}
        userHasVote={proposal.viewerHasVote}
        hasReachedLimit={step.votesLimit && step.votesLimit - viewerVotesCount <= 0}
        hasUserEnoughCredits={this.userHasEnoughCredits()}>
        <HoverObserver>
          <ProposalVoteButton
            id={id}
            proposal={proposal}
            step={step}
            user={viewer}
            className={className}
            disabled={!proposal.viewerHasVote && !this.userHasEnoughCredits()}
          />
        </HoverObserver>
      </VoteButtonOverlay>
    );
  }
}

export default createFragmentContainer(ProposalVoteButtonWrapperFragment, {
  proposal: graphql`
    fragment ProposalVoteButtonWrapperFragment_proposal on Proposal
      @argumentDefinitions(
        isAuthenticated: { type: "Boolean", defaultValue: true }
        stepId: { type: "ID!" }
      ) {
      id
      estimation
      viewerHasVote(step: $stepId) @include(if: $isAuthenticated)
      ...ProposalVoteButton_proposal @arguments(stepId: $stepId, isAuthenticated: $isAuthenticated)
    }
  `,
  viewer: graphql`
    fragment ProposalVoteButtonWrapperFragment_viewer on User
      @argumentDefinitions(
        isAuthenticated: { type: "Boolean", defaultValue: true }
        stepId: { type: "ID!" }
      ) {
      id
      proposalVotes(stepId: $stepId) @include(if: $isAuthenticated) {
        totalCount
        creditsLeft
      }
    }
  `,
  step: graphql`
    fragment ProposalVoteButtonWrapperFragment_step on ProposalStep {
      id
      title
      votesLimit
      voteType
      open
      ...VoteButtonOverlay_step
    }
  `,
});
