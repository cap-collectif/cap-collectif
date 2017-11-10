// @flow
import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

const ProposalPreviewFooter = React.createClass({
  propTypes: {
    proposal: PropTypes.object.isRequired,
    stepId: PropTypes.string.isRequired,
    showVotes: PropTypes.bool,
  },

  getDefaultProps() {
    return {
      showVotes: false,
    };
  },

  render() {
    const { proposal, stepId, showVotes } = this.props;
    const votesCount = proposal.votesCountByStepId[stepId];
    const counterWidth = showVotes ? '50%' : '100%';

    return (
      <div className="proposal__footer">
        <div className="proposal__counters">
          <div
            className="proposal__counter proposal__counter--comments"
            style={{ width: counterWidth }}>
            <div className="proposal__counter__value">{proposal.comments_count}</div>
            <div className="proposal__counter__label">
              <FormattedMessage
                id="comment.count_no_nb"
                values={{
                  count: proposal.comments_count,
                }}
              />
            </div>
          </div>
          {showVotes && (
            <div
              className="proposal__counter proposal__counter--votes"
              style={{ width: counterWidth, borderLeft: '1px solid #ccc' }}>
              <div className="proposal__counter__value">{votesCount}</div>
              <div className="proposal__counter__label">
                <FormattedMessage
                  id="proposal.vote.count_no_nb"
                  values={{
                    count: votesCount,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
});

export default ProposalPreviewFooter;
