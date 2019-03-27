// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { ProgressBar } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import type { ProposalVoteThresholdProgressBar_proposal } from './__generated__/ProposalVoteThresholdProgressBar_proposal.graphql';
import type { ProposalVoteThresholdProgressBar_step } from './__generated__/ProposalVoteThresholdProgressBar_step.graphql';

type Props = {
  proposal: ProposalVoteThresholdProgressBar_proposal,
  step: ProposalVoteThresholdProgressBar_step,
};

export class ProposalVoteThresholdProgressBar extends React.Component<Props> {
  render() {
    const { proposal, step } = this.props;
    const votesCount = proposal.votes.totalCount;
    const { voteThreshold } = step;
    if (voteThreshold === null || typeof voteThreshold === 'undefined') {
      return null;
    }

    return (
      <div className="card__threshold" style={{ fontSize: '85%', marginTop: '15px' }}>
        <p>
          <i className="cap cap-hand-like-2-1" />{' '}
          {votesCount >= voteThreshold && <FormattedMessage id="proposal.vote.threshold.reached" />}
          {votesCount < voteThreshold && (
            <FormattedMessage
              id="vote.count"
              values={{
                count: votesCount,
              }}
            />
          )}
        </p>
        <ProgressBar
          min={0}
          max={votesCount >= voteThreshold ? votesCount : voteThreshold}
          now={votesCount}
          className="mb-0"
          bsStyle="success"
          label={
            votesCount >= voteThreshold ? (
              <FormattedMessage id="proposal.vote.threshold.reached" />
            ) : (
              ''
            )
          }
        />
      </div>
    );
  }
}

export default createFragmentContainer(ProposalVoteThresholdProgressBar, {
  proposal: graphql`
    fragment ProposalVoteThresholdProgressBar_proposal on Proposal {
      id
      votes(stepId: $stepId, first: 0) {
        totalCount
      }
    }
  `,
  step: graphql`
    fragment ProposalVoteThresholdProgressBar_step on Step {
      id
      ... on CollectStep {
        voteThreshold
      }
      ... on SelectionStep {
        voteThreshold
      }
    }
  `,
});
