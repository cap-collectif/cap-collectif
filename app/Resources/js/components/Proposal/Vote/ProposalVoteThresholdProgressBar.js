import React, { PropTypes } from 'react';
import { IntlMixin, FormattedMessage } from 'react-intl';
import { ProgressBar } from 'react-bootstrap';

const ProposalVoteThresholdProgressBar = React.createClass({
  propTypes: {
    proposal: PropTypes.object.isRequired,
    voteThreshold: PropTypes.number.isRequired,
    selectionStepId: PropTypes.number,
    votesDelta: PropTypes.number.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      selectionStepId: null,
    };
  },

  render() {
    const { proposal, voteThreshold, selectionStepId, votesDelta } = this.props;

    const votesCount = selectionStepId
        ? proposal.votesCountBySelectionSteps[selectionStepId]
        ? proposal.votesCountBySelectionSteps[selectionStepId] + votesDelta
        : 0 + votesDelta
        : proposal.votesCount;

    return (
      <div className="propopal__vote_threshold--no-min-width" style={{ fontSize: '85%' }}>
        <p>
          <i className="cap cap-hand-like-2-1"></i>{' '}
          {votesCount >= voteThreshold && this.getIntlMessage('proposal.vote.threshold.reached')}
          {
            votesCount < voteThreshold &&
            <FormattedMessage
              message={this.getIntlMessage('vote.count')}
              count={votesCount}
            />
          }
        </p>
        <ProgressBar
          min={0}
          max={voteThreshold}
          now={votesCount}
          bsStyle="success"
        />
      </div>
    );
  },
});

export default ProposalVoteThresholdProgressBar;
