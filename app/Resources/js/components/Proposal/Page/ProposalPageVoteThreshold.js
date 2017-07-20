import React, { PropTypes } from 'react';
import { IntlMixin, FormattedMessage } from 'react-intl';
import { ProgressBar } from 'react-bootstrap';

const ProposalPageVoteThreshold = React.createClass({
  displayName: 'ProposalPageVoteThreshold',
  propTypes: {
    proposal: PropTypes.object.isRequired,
    step: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { proposal, step } = this.props;
    const votesCount = proposal.votesCountByStepId[step.id];
    const votesRemaining = step.voteThreshold - votesCount;
    const votesPercentage = Math.ceil((votesCount * 100) / step.voteThreshold);
    return (
      <div className="proposal__page__vote_threshold">
        <div className="proposal__infos" style={{ marginTop: '-15px' }}>
          <h4>
            {
              votesPercentage >= 100
                ? this.getIntlMessage('proposal.vote.threshold.reached')
                : this.getIntlMessage('proposal.vote.threshold.title')
            }
          </h4>
          <p className="proposal__page__vote_threshold__votes">
            <i className="cap cap-hand-like-2-1"></i>{' '}
            <FormattedMessage
              message={this.getIntlMessage('proposal.vote.count')}
              num={votesCount}
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
            {
              votesPercentage >= 100 &&
              <FormattedMessage
                message={this.getIntlMessage('proposal.vote.threshold.progress_reached')}
                num={votesCount}
                max={step.voteThreshold}
              />
            }
            {
              votesPercentage < 100 &&
              <FormattedMessage
                message={this.getIntlMessage('proposal.vote.threshold.progress')}
                num={votesRemaining}
                max={step.voteThreshold}
              />
            }
          </div>
        </div>
      </div>
    );
  },

});

export default ProposalPageVoteThreshold;
