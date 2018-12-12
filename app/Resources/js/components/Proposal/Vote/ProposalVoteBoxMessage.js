// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';

type Props = {
  step: Object,
  enoughCredits: boolean,
  submitting: boolean,
};

export class ProposalVoteBoxMessage extends React.Component<Props> {
  getMessage = () => {
    const { enoughCredits, step, submitting } = this.props;
    if (!enoughCredits && !submitting) {
      return <FormattedMessage id="proposal.vote.not_enough_credits" />;
    }
    if (step.status === 'FUTURE') {
      return <FormattedMessage id="proposal.vote.step_not_yet_open" />;
    }
    if (step.status === 'CLOSED') {
      return <FormattedMessage id="proposal.vote.step_closed" />;
    }
    return null;
  };

  render() {
    const message = this.getMessage();
    return message ? <p style={{ marginBottom: '15px' }}>{message}</p> : null;
  }
}

export default ProposalVoteBoxMessage;
