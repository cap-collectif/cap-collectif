// @flow
import * as React from 'react';
import { FormattedDate, FormattedTime, FormattedMessage } from 'react-intl';
import moment from 'moment';

const DatesInterval = React.createClass({
  propTypes: {
    startAt: React.PropTypes.string,
    endAt: React.PropTypes.string,
    fullDay: React.PropTypes.bool,
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

  render(): ?React.Element<any> {
    const { startAt, endAt, fullDay } = this.props;

    if (!startAt) {
      return null;
    }

    const startAtDate = moment(startAt).toDate();

    const startDay = (
      <FormattedDate value={startAtDate} day="numeric" month="long" year="numeric" />
    );
    const startTime = <FormattedTime value={startAtDate} hour="numeric" minute="numeric" />;

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

    const endAtDate = moment(endAt).toDate();

    const endTime = <FormattedTime value={endAtDate} hour="numeric" minute="numeric" />;
    const endDay = <FormattedDate value={endAtDate} day="numeric" month="long" year="numeric" />;

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

    if (fullDay && endAt && startAt) {
      return (
        <FormattedMessage
          id="global.dates.full.days"
          values={{
            startD: startDay,
            startT: startTime,
            endD: endDay,
            endT: endTime,
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
