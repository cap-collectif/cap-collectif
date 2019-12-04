// @flow
import * as React from 'react';
import { FormattedDate, FormattedTime, FormattedMessage } from 'react-intl';
import moment from 'moment-timezone';

// https://developer.mozilla.org/en-US/docs/public/JavaScript/Reference/Global_Objects/DateTimeFormat
type DateStyleNumeric = 'numeric' | '2-digit';

type Props = {|
  +startAt?: ?string,
  +endAt?: ?string,
  +fullDay?: boolean,
  +showCurrentYear?: boolean,
  +second?: DateStyleNumeric,
  +minute?: DateStyleNumeric,
  +hour?: DateStyleNumeric,
  +day?: DateStyleNumeric,
  +month?: DateStyleNumeric | 'long' | 'short' | 'narrow',
  +year?: DateStyleNumeric,
|};

export class DatesInterval extends React.Component<Props> {
  static defaultProps = {
    showCurrentYear: true,
    second: 'numeric',
    minute: 'numeric',
    hour: 'numeric',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };

  lastOneDay(): boolean {
    const { startAt, endAt } = this.props;
    return moment(endAt).diff(moment(startAt), 'days') < 1;
  }

  render() {
    const { startAt, endAt, fullDay, day, month, year, minute, hour, showCurrentYear } = this.props;
    const now = moment().toDate();
    const startAtDate = moment(startAt).toDate();
    const startDay = (
      <FormattedDate
        value={startAtDate}
        day={day}
        month={month}
        year={
          !showCurrentYear && now.getFullYear() === startAtDate.getFullYear() ? undefined : year
        }
      />
    );
    const startTime = <FormattedTime value={startAtDate} hour={hour} minute={minute} />;

    const endAtDate = moment(endAt).toDate();
    const endDay = (
      <FormattedDate
        value={endAtDate}
        day={day}
        month={month}
        year={!showCurrentYear && now.getFullYear() === endAtDate.getFullYear() ? undefined : year}
      />
    );
    const endTime = <FormattedTime value={endAtDate} hour={hour} minute={minute} />;

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
