import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { VOTE_TYPE_BUDGET } from '../../../constants/ProposalConstants';
import { connect } from 'react-redux';

const ProposalVoteBoxMessage = React.createClass({
  propTypes: {
    step: PropTypes.object.isRequired,
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
    const {
      enoughCredits,
      step,
      submitting,
      user,
    } = this.props;
    if (!enoughCredits && !submitting) {
      return this.getIntlMessage('proposal.vote.not_enough_credits');
    }
    if (step.status === 'future') {
      return this.getIntlMessage('proposal.vote.step_not_yet_open');
    }
    if (step.status === 'closed') {
      return this.getIntlMessage('proposal.vote.step_closed');
    }
    if (step.voteType === VOTE_TYPE_BUDGET && !user) {
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
    user: state.default.user,
  };
};

export default connect(mapStateToProps)(ProposalVoteBoxMessage);
