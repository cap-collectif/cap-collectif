import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { ProgressBar } from 'react-bootstrap';

const ProposalVoteThresholdProgressBar = React.createClass({
  propTypes: {
    proposal: PropTypes.object.isRequired,
    step: PropTypes.object.isRequired,
  },

  render() {
    const { proposal, step } = this.props;
    const votesCount = proposal.votesCountByStepId[step.id];
    const voteThreshold = step.voteThreshold;
    return (
      <div className="propopal__vote_threshold--no-min-width" style={{ fontSize: '85%', marginTop: '20px' }}>
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
  },
});

export default ProposalVoteThresholdProgressBar;
