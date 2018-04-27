// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import ProposalVoteButton from './ProposalVoteButton';
import VoteButtonOverlay from './VoteButtonOverlay';
import LoginOverlay from '../../Utils/LoginOverlay';
import type { ProposalVoteButtonWrapperFragment_proposal } from './__generated__/ProposalVoteButtonWrapperFragment_proposal.graphql';
import type { ProposalVoteButtonWrapperFragment_step } from './__generated__/ProposalVoteButtonWrapperFragment_step.graphql';
import type { ProposalVoteButtonWrapperFragment_viewer } from './__generated__/ProposalVoteButtonWrapperFragment_viewer.graphql';

type Props = {
  proposal: ProposalVoteButtonWrapperFragment_proposal,
  viewer: ProposalVoteButtonWrapperFragment_viewer,
  step: ProposalVoteButtonWrapperFragment_step,
  id: string,
  className: string,
};

export class ProposalVoteButtonWrapperFragment extends React.Component<Props> {
  static defaultProps = {
    id: undefined,
    className: '',
  };

  userHasEnoughCredits = () => {
    const { viewer, proposal } = this.props;
    const creditsLeft = viewer.proposalVotes.creditsLeft;
    if (creditsLeft !== null && typeof creditsLeft !== 'undefined' && proposal.estimation) {
      return creditsLeft >= proposal.estimation;
    }
    return true;
  };

  render() {
    const { id, viewer, step, proposal, className } = this.props;
    if (!viewer) {
      return (
        <LoginOverlay>
          <Button id={id} bsStyle="success" className={className}>
            <FormattedMessage id="proposal.vote.add" />
          </Button>
        </LoginOverlay>
      );
    }
    const popoverId = `vote-tooltip-proposal-${proposal.id}`;
    if (step.voteType === 'SIMPLE') {
      return (
        /* $FlowFixMe */
        <VoteButtonOverlay
          popoverId={popoverId}
          step={step}
          userHasVote={proposal.viewerHasVote || false}
          hasReachedLimit={
            !proposal.viewerHasVote &&
            step.votesLimit &&
            step.votesLimit - viewer.proposalVotes.totalCount <= 0
          }>
          <ProposalVoteButton
            userHasVote={proposal.viewerHasVote}
            id={id}
            proposal={proposal}
            step={step}
            user={viewer}
            disabled={false}
          />
        </VoteButtonOverlay>
      );
    }

    return (
      /* $FlowFixMe */
      <VoteButtonOverlay
        popoverId={popoverId}
        step={step}
        userHasVote={proposal.viewerHasVote}
        hasReachedLimit={step.votesLimit && step.votesLimit - viewer.proposalVotes.totalCount <= 0}
        hasUserEnoughCredits={this.userHasEnoughCredits()}>
        <ProposalVoteButton
          id={id}
          proposal={proposal}
          userHasVote={proposal.viewerHasVote}
          step={step}
          user={viewer}
          className={className}
          disabled={!proposal.viewerHasVote && !this.userHasEnoughCredits()}
        />
      </VoteButtonOverlay>
    );
  }
}

export default createFragmentContainer(ProposalVoteButtonWrapperFragment, {
  proposal: graphql`
    fragment ProposalVoteButtonWrapperFragment_proposal on Proposal
      @argumentDefinitions(
        isAuthenticated: { type: "Boolean", defaultValue: true }
        stepId: { type: "ID!", nonNull: true }
      ) {
      id
      estimation
      viewerHasVote(step: $stepId) @include(if: $isAuthenticated)
    }
  `,
  viewer: graphql`
    fragment ProposalVoteButtonWrapperFragment_viewer on User
      @argumentDefinitions(stepId: { type: "ID!", nonNull: true }) {
      id
      proposalVotes(stepId: $stepId) {
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
      ...VoteButtonOverlay_step
    }
  `,
});
