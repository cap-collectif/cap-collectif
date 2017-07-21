import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

const ProposalVoteBoxMessage = React.createClass({
  propTypes: {
    step: PropTypes.object.isRequired,
    enoughCredits: PropTypes.bool.isRequired,
    submitting: PropTypes.bool.isRequired,
  },

  getMessage() {
    const { enoughCredits, step, submitting } = this.props;
    if (!enoughCredits && !submitting) {
      return <FormattedMessage id="proposal.vote.not_enough_credits" />;
    }
    if (step.status === 'future') {
      return <FormattedMessage id="proposal.vote.step_not_yet_open" />;
    }
    if (step.status === 'closed') {
      return <FormattedMessage id="proposal.vote.step_closed" />;
    }
    return null;
  },

  render() {
    const message = this.getMessage();
    return message
      ? <p style={{ marginBottom: '15px' }}>
          {message}
        </p>
      : null;
  },
});

export default ProposalVoteBoxMessage;
