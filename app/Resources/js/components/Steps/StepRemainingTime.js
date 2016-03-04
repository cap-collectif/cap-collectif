import React from 'react';
import { IntlMixin, FormattedMessage } from 'react-intl';

const StepRemainingTime = React.createClass({
  propTypes: {
    step: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { step } = this.props;
    const counters = step.counters;
    if (!counters) {
      return null;
    }
    if (counters.remainingHours) {
      return (
        <FormattedMessage
          message={this.getIntlMessage('step.remaining.hours')}
          num={counters.remainingHours}
        />
      );
    }
    return (
      <FormattedMessage
        message={this.getIntlMessage('step.remaining.days')}
        num={counters.remainingDays || 0}
      />
    );
  },

});

export default StepRemainingTime;
