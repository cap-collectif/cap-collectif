// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';

type Props = {
  step: Object,
};

class StepRemainingTime extends React.Component<Props> {
  render() {
    const { step } = this.props;
    const counters = step.counters;
    if (!counters) {
      return null;
    }
    if (counters.remainingHours) {
      return (
        <FormattedMessage id="step.remaining.hours" values={{ num: counters.remainingHours }} />
      );
    }
    return (
      <FormattedMessage id="step.remaining.days" values={{ num: counters.remainingDays || 0 }} />
    );
  }
}

export default StepRemainingTime;
