import React from 'react';
import { IntlMixin, FormattedMessage } from 'react-intl';
import classNames from 'classnames';

const ProposalPreviewFooter = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
    selectionStepId: React.PropTypes.number,
    showVotes: React.PropTypes.bool,
    votesDelta: React.PropTypes.number.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      selectionStepId: null,
      showVotes: false,
    };
  },

  render() {
    const proposal = this.props.proposal;
    const statusClasses = {
      'proposal__status': true,
      'status--default': !proposal.status,
    };
    if (proposal.status) {
      statusClasses['status--' + proposal.status.color] = true;
    }
    const votesCount = this.props.selectionStepId
      ? proposal.votesCountBySelectionSteps[this.props.selectionStepId]
        ? proposal.votesCountBySelectionSteps[this.props.selectionStepId] + this.props.votesDelta
        : 0 + this.props.votesDelta
      : proposal.votesCount
    ;
    const counterWidth = this.props.showVotes ? '50%' : '100%';

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
            this.props.showVotes
            ? <div className="proposal__counter proposal__counter--votes" style={{ width: counterWidth, borderLeft: '1px solid #ccc' }}>
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
            : null
          }
        </div>
        <div className={classNames(statusClasses)}>
          {
            proposal.status
            ? proposal.status.name
            : this.getIntlMessage('proposal.no_status')
          }
        </div>
      </div>
    );
  },

});

export default ProposalPreviewFooter;
