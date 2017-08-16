// @flow
import React from 'react';
import { FormattedDate, FormattedMessage, FormattedTime } from 'react-intl';
import moment from 'moment';

const DatesInterval = React.createClass({
  propTypes: {
    startAt: React.PropTypes.string,
    endAt: React.PropTypes.string,
  },

  getDefaultProps(): Object {
    return {
      startAt: null,
      endAt: null,
    };
  },

  lastOneDay(): boolean {
    const { startAt, endAt } = this.props;
    return moment(endAt).diff(moment(startAt), 'days') < 1;
  },

  render(): ?React$Element<> {
    const { startAt, endAt } = this.props;

    if (!startAt) {
      return null;
    }

    const startAtObject = moment(startAt);

    const startDay = (
      <FormattedDate
        value={startAtObject}
        day="numeric"
        month="long"
        year="numeric"
      />
    );
    const startTime = (
      <FormattedTime value={startAtObject} hour="numeric" minute="numeric" />
    );

    if (!endAt) {
      return (
        <FormattedMessage
          id="global.dates.full_day"
          values={{
            date: startDay,
            time: startTime,
          }}
        />
      );
    }

    const endAtObject = moment(endAt);

    const endTime = (
      <FormattedTime value={endAtObject} hour="numeric" minute="numeric" />
    );
    const endDay = (
      <FormattedDate
        value={endAtObject}
        day="numeric"
        month="long"
        year="numeric"
      />
    );

    if (this.lastOneDay()) {
      return (
        <FormattedMessage
          id="global.dates.part_day"
          values={{
            date: startDay,
            startTime,
            endTime,
          }}
        />
      );
    }

    return (
      <FormattedMessage
        id="global.dates.between"
        values={{
          start: startDay,
          end: endDay,
        }}
      />
    );
  },
});

export default DatesInterval;
