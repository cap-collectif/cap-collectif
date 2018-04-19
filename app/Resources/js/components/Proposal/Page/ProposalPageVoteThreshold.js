// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { ProgressBar } from 'react-bootstrap';
import type { ProposalPageVoteThreshold_step } from './__generated__/ProposalPageVoteThreshold_step.graphql';

type Props = {
  proposal: Object,
  step: ProposalPageVoteThreshold_step,
};

export class ProposalPageVoteThreshold extends React.Component<Props> {

  render() {
    const { proposal, step } = this.props;
    const votesCount = proposal.votesCountByStepId[step.id];
    const votesRemaining = step.voteThreshold - votesCount;
    const votesPercentage = Math.ceil(votesCount * 100 / step.voteThreshold);
    return (
      <div className="proposal__page__vote_threshold">
        <div className="proposal__infos" style={{ marginTop: '-15px' }}>
          <h4>
            {votesPercentage >= 100 ? (
              <FormattedMessage id="proposal.vote.threshold.reached" />
            ) : (
              <FormattedMessage id="proposal.vote.threshold.title" />
            )}
          </h4>
          <p className="proposal__page__vote_threshold__votes">
            <i className="cap cap-hand-like-2-1" />{' '}
            <FormattedMessage
              id="proposal.vote.count"
              values={{
                num: votesCount,
              }}
            />
          </p>
          <ProgressBar
            now={votesPercentage}
            label={`${votesPercentage}%`}
            min={0}
            max={votesPercentage > 100 ? votesPercentage : 100}
            bsStyle="success"
          />
          <div>
            {votesPercentage >= 100 && (
              <FormattedMessage
                id="proposal.vote.threshold.progress_reached"
                values={{
                  num: votesCount,
                  max: step.voteThreshold,
                }}
              />
            )}
            {votesPercentage < 100 && (
              <FormattedMessage
                id="proposal.vote.threshold.progress"
                values={{
                  num: votesRemaining,
                  max: step.voteThreshold,
                }}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
};

export default createFragmentContainer(
  ProposalPageVoteThreshold,
  {
    step: graphql`
      fragment ProposalPageVoteThreshold_step on Step {
        id
        ... on CollectStep {
          voteThreshold
        }
        ... on SelectionStep {
          voteThreshold
        }
      }
    `,
  }
);
