import React from 'react';
import { IntlMixin, FormattedMessage } from 'react-intl';

const RemainingTime = React.createClass({
  propTypes: {
    days: React.PropTypes.number,
    hours: React.PropTypes.number,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      days: 0,
      hours: 0,
    };
  },

  render() {
    const { days, hours } = this.props;
    if (hours > 0) {
      return (
        <FormattedMessage
          message={this.getIntlMessage('global.remaining.hours')}
          num={hours}
        />
      );
    }
    return (
      <FormattedMessage
        message={this.getIntlMessage('global.remaining.days')}
        num={days}
      />
    );
  },

});

export default RemainingTime;
