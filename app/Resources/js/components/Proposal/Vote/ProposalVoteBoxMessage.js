import React from 'react';
import { IntlMixin } from 'react-intl';
import LoginStore from '../../../stores/LoginStore';
import { VOTE_TYPE_BUDGET } from '../../../constants/ProposalConstants';

const ProposalVoteBoxMessage = React.createClass({
  propTypes: {
    selectionStep: React.PropTypes.object.isRequired,
    enoughCredits: React.PropTypes.bool.isRequired,
    submitting: React.PropTypes.bool.isRequired,
  },
  mixins: [IntlMixin],

  getMessage() {
    if (!this.props.enoughCredits && !this.props.submitting) {
      return this.getIntlMessage('proposal.vote.not_enough_credits');
    }
    if (this.props.selectionStep.openingStatus === 'future') {
      return this.getIntlMessage('proposal.vote.step_not_yet_open');
    }
    if (this.props.selectionStep.openingStatus === 'closed') {
      return this.getIntlMessage('proposal.vote.step_closed');
    }
    if (this.props.selectionStep.voteType === VOTE_TYPE_BUDGET && !LoginStore.isLoggedIn()) {
      return this.getIntlMessage('proposal.vote.must_log_in');
    }
    return null;
  },

  render() {
    const message = this.getMessage();
    return message
        ? <p style={{ marginBottom: '15px' }}>
          {message}
        </p>
        : null
    ;
  },
});

export default ProposalVoteBoxMessage;
