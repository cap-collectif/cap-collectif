// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import ProposalVoteModal from '../Vote/ProposalVoteModal';
import ProposalVoteButtonWrapperFragment from '../Vote/ProposalVoteButtonWrapperFragment';
import type { ProposalPreviewVote_proposal } from './__generated__/ProposalPreviewVote_proposal.graphql';
import type { ProposalPreviewVote_step } from './__generated__/ProposalPreviewVote_step.graphql';
import type { ProposalPreviewVote_viewer } from './__generated__/ProposalPreviewVote_viewer.graphql';

type Props = {
  proposal: ProposalPreviewVote_proposal,
  step: ProposalPreviewVote_step,
  viewer: ?ProposalPreviewVote_viewer,
};

export class ProposalPreviewVote extends React.Component<Props> {
  render() {
    const { proposal, step, viewer } = this.props;
    return (
      <span>
        {/* $FlowFixMe */}
        <ProposalVoteButtonWrapperFragment
          proposal={proposal}
          step={step}
          viewer={viewer}
          id={`proposal-vote-btn-${proposal.id}`}
          className="proposal__preview__vote mr-15"
        />
        {viewer && <ProposalVoteModal proposal={proposal} step={step} />}
      </span>
    );
  }
}

export default createFragmentContainer(ProposalPreviewVote, {
  viewer: graphql`
    fragment ProposalPreviewVote_viewer on User {
      ...ProposalVoteButtonWrapperFragment_viewer
        @arguments(isAuthenticated: $isAuthenticated, stepId: $stepId)
    }
  `,
  proposal: graphql`
    fragment ProposalPreviewVote_proposal on Proposal
      @argumentDefinitions(isAuthenticated: { type: "Boolean", defaultValue: true }) {
      id
      ...ProposalVoteModal_proposal @arguments(stepId: $stepId) @include(if: $isAuthenticated)
      ...ProposalVoteButtonWrapperFragment_proposal
        @arguments(stepId: $stepId, isAuthenticated: $isAuthenticated)
    }
  `,
  step: graphql`
    fragment ProposalPreviewVote_step on Step
      @argumentDefinitions(isAuthenticated: { type: "Boolean", defaultValue: true }) {
      ...ProposalVoteModal_step @include(if: $isAuthenticated)
      ...ProposalVoteButtonWrapperFragment_step
    }
  `,
});
