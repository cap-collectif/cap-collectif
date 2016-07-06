import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { VOTE_TYPE_BUDGET } from '../../../constants/ProposalConstants';
import { connect } from 'react-redux';

const ProposalVoteBoxMessage = React.createClass({
  propTypes: {
    selectionStep: PropTypes.object.isRequired,
    enoughCredits: PropTypes.bool.isRequired,
    submitting: PropTypes.bool.isRequired,
    user: PropTypes.object,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      user: null,
    };
  },

  getMessage() {
    if (!this.props.enoughCredits && !this.props.submitting) {
      return this.getIntlMessage('proposal.vote.not_enough_credits');
    }
    if (this.props.selectionStep.status === 'future') {
      return this.getIntlMessage('proposal.vote.step_not_yet_open');
    }
    if (this.props.selectionStep.status === 'closed') {
      return this.getIntlMessage('proposal.vote.step_closed');
    }
    if (this.props.selectionStep.voteType === VOTE_TYPE_BUDGET && !this.props.user) {
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

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default connect(mapStateToProps)(ProposalVoteBoxMessage);
