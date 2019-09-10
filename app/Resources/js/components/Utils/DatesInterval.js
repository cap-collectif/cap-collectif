// @flow
import * as React from 'react';
import { FormattedDate, FormattedTime, FormattedMessage } from 'react-intl';
import moment from 'moment-timezone';

type Props = {|
  +startAt?: ?string,
  +endAt?: ?string,
  +fullDay?: boolean,
|};

export class DatesInterval extends React.Component<Props> {
  lastOneDay(): boolean {
    const { startAt, endAt } = this.props;
    return moment(endAt).diff(moment(startAt), 'days') < 1;
  }

  render() {
    const { startAt, endAt, fullDay } = this.props;

    const startAtDate = moment(startAt).toDate();
    const startDay = (
      <FormattedDate value={startAtDate} day="numeric" month="long" year="numeric" />
    );
    const startTime = <FormattedTime value={startAtDate} hour="numeric" minute="numeric" />;

    const endAtDate = moment(endAt).toDate();
    const endDay = <FormattedDate value={endAtDate} day="numeric" month="long" year="numeric" />;
    const endTime = <FormattedTime value={endAtDate} hour="numeric" minute="numeric" />;

    if (startAt) {
      const startT = startAt.substr(11, 5);

      if (!endAt) {
        if (startT !== '00:00') {
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

        return (
          <FormattedMessage
            id="global.dates.startDay.startNoTime"
            values={{
              startD: startDay,
            }}
          />
        );
      }

      if (endAt) {
        const endT = endAt.substr(11, 5);

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

    if (!startAt && endAt) {
      const endDate = moment(endAt);
      const endT = endAt.substr(11, 5);
      const now = moment();

      if (endDate.diff(now, 'days') < 0) {
        return (
          <FormattedMessage
            id="global.dates.pastDate"
            values={{
              endD: endDay,
            }}
          />
        );
      }

      if (endT !== '00:00') {
        return (
          <FormattedMessage
            id="global.dates.endDate"
            values={{
              endD: endDay,
              endT: endTime,
            }}
          />
        );
      }

      return (
        <FormattedMessage
          id="global.dates.endDate.endNoTime"
          values={{
            endD: endDay,
          }}
        />
      );
    }

    return null;
  }
}

export default DatesInterval;
