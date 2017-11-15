// @flow
import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

const ProposalPreviewFooter = React.createClass({
  propTypes: {
    proposal: PropTypes.object.isRequired,
    stepId: PropTypes.string.isRequired,
    showVotes: PropTypes.bool,
    showComments: PropTypes.bool,
  },

  getDefaultProps() {
    return {
      showVotes: false,
      showComments: false,
    };
  },

  render() {
    const { proposal, stepId, showVotes, showComments } = this.props;
    const votesCount = proposal.votesCountByStepId[stepId];
    const counterVoteWidth = showVotes ? '50%' : '100%';
    const counterCommentsWidth = showComments ? '50%' : '100%';

    if (!showVotes && !showComments) {
      return null;
    }

    return (
      <div className="proposal__footer">
        <div className="proposal__counters">
          {showComments && (
            <div
              className="proposal__counter proposal__counter--comments"
              style={{ width: counterVoteWidth }}>
              <div className="proposal__counter__value">{proposal.commentsCount}</div>
              <div className="proposal__counter__label">
                <FormattedMessage
                  id="comment.count_no_nb"
                  values={{
                    count: proposal.commentsCount,
                  }}
                />
              </div>
            </div>
          )}
          {showVotes && (
            <div
              className="proposal__counter proposal__counter--votes"
              style={{ width: counterCommentsWidth, borderLeft: '1px solid #ccc' }}>
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
