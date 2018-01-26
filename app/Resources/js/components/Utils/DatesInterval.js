// @flow
import * as React from 'react';
import { FormattedDate, FormattedTime, FormattedMessage } from 'react-intl';
import moment from 'moment';

type Props = {
  startAt: ?string,
  endAt: ?string,
  fullDay: ?boolean,
};

export class DatesInterval extends React.Component<Props> {
  static defaultProps = {
    startAt: null,
    endAt: null,
  };

  lastOneDay(): boolean {
    const { startAt, endAt } = this.props;
    return moment(endAt).diff(moment(startAt), 'days') < 1;
  }

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

    const startT = startAt.substr(11, 5);
    const endT = endAt.substr(11, 5);

    if (fullDay && endAt && startAt && endT !== '00:00' && startT !== '00:00') {
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

    if (fullDay && endAt && startAt && endT !== '00:00' && startT === '00:00') {
      return (
        <FormattedMessage
          id="global.dates.full.days.startNoTime"
          values={{
            startD: startDay,
            endD: endDay,
            endT: endTime,
          }}
        />
      );
    }

    if (fullDay && endAt && startAt && endT === '00:00' && startT !== '00:00') {
      return (
        <FormattedMessage
          id="global.dates.full.days.endNoTime"
          values={{
            startD: startDay,
            startT: startTime,
            endD: endDay,
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
  }
}

export default DatesInterval;
