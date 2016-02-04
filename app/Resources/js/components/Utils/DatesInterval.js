import React from 'react';
import { IntlMixin, FormattedDate, FormattedMessage } from 'react-intl';
import moment from 'moment';

const DatesInterval = React.createClass({
  propTypes: {
    startAt: React.PropTypes.string.isRequired,
    endAt: React.PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      endAt: null,
    };
  },

  lastOneDay() {
    const { startAt, endAt } = this.props;
    return moment(startAt).diff(moment(endAt), 'days') < 1;
  },

  render() {
    const { startAt, endAt } = this.props;

    const startDay = (
      <FormattedDate
        value={moment(startAt)}
        day="numeric" month="long" year="numeric"
      />
    );
    const startTime = (
      <FormattedDate
        value={moment(startAt)}
        hour="numeric" minute="numeric"
      />
    );

    if (!endAt) {
      return (
        <FormattedMessage
          message={this.getIntlMessage('global.dates.full_day')}
          date={startDay}
          time={startTime}
        />
      );
    }

    const endTime = (
      <FormattedDate
        value={moment(endAt)}
        hour="numeric" minute="numeric"
      />
    );
    const endDay = (
      <FormattedDate
        value={moment(endAt)}
        day="numeric" month="long" year="numeric"
      />
    );

    if (this.lastOneDay()) {
      return (
        <FormattedMessage
          message={this.getIntlMessage('global.dates.part_day')}
          date={startDay}
          startTime={startTime}
          endTime={endTime}
        />
      );
    }

    return (
      <FormattedMessage
        message={this.getIntlMessage('global.dates.between')}
        start={startDay}
        end={endDay}
      />
    );
  },
});

export default DatesInterval;
