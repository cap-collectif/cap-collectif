// @flow
import React from 'react';
import { FormattedDate, FormattedMessage } from 'react-intl';
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

    const startDay = (
      <FormattedDate
        value={moment(startAt)}
        day="numeric"
        month="long"
        year="numeric"
      />
    );
    const startTime = (
      <FormattedDate value={moment(startAt)} hour="numeric" minute="numeric" />
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

    const endTime = (
      <FormattedDate value={moment(endAt)} hour="numeric" minute="numeric" />
    );
    const endDay = (
      <FormattedDate
        value={moment(endAt)}
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
