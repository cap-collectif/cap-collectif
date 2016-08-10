import React, { PropTypes } from 'react';
import { IntlMixin, FormattedMessage } from 'react-intl';

const ProposalPreviewFooter = React.createClass({
  propTypes: {
    proposal: PropTypes.object.isRequired,
    stepId: PropTypes.number.isRequired,
    showVotes: PropTypes.bool,
    votesDelta: PropTypes.number.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      stepId: null,
      showVotes: false,
    };
  },

  render() {
    const { proposal, stepId, votesDelta, showVotes } = this.props;
    const votesCount = stepId
      ? proposal.votesCountBySteps[stepId]
        ? proposal.votesCountBySteps[stepId] + votesDelta
        : 0 + votesDelta
      : proposal.votesCount
    ;
    const counterWidth = showVotes ? '50%' : '100%';

    return (
      <div className="proposal__footer">
        <div className="proposal__counters">
          <div className="proposal__counter proposal__counter--comments" style={{ width: counterWidth }}>
            <div className="proposal__counter__value" >
              {proposal.comments_count}
            </div>
            <div className="proposal__counter__label" >
              <FormattedMessage
                message={this.getIntlMessage('comment.count_no_nb')}
                count={proposal.comments_count}
              />
            </div>
          </div>
          {
            showVotes
            && <div className="proposal__counter proposal__counter--votes" style={{ width: counterWidth, borderLeft: '1px solid #ccc' }}>
                <div className="proposal__counter__value" >
                  {votesCount}
                </div>
                <div className="proposal__counter__label" >
                  <FormattedMessage
                    message={this.getIntlMessage('proposal.vote.count_no_nb')}
                    count={votesCount}
                  />
                </div>
              </div>
          }
        </div>
      </div>
    );
  },

});

export default ProposalPreviewFooter;
