import React from 'react';
import { FormattedMessage } from 'react-intl';

const RemainingTime = React.createClass({
  propTypes: {
    days: React.PropTypes.number,
    hours: React.PropTypes.number,
  },

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
          id="global.remaining.hours"
          values={{
            num: hours,
          }}
        />
      );
    }
    return (
      <FormattedMessage
        id="global.remaining.days"
        values={{
          num: days,
        }}
      />
    );
  },
});

export default RemainingTime;
