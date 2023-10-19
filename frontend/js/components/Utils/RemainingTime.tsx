import * as React from 'react'
import cn from 'classnames'
import moment from 'moment'
import { FormattedMessage } from 'react-intl'
type Props = {
  readonly endAt: string
  readonly noStyle?: boolean
}
export class RemainingTime extends React.Component<Props> {
  render() {
    const { endAt, noStyle } = this.props
    const endDate = moment(endAt)
    const now = moment()
    const daysLeft = endDate.diff(now, 'days')
    const hoursLeft = endDate.diff(now, 'hours')
    const minutesLeft = endDate.diff(now, 'minutes')
    let timeLeft = (
      <span>
        <span
          className={cn({
            excerpt_dark: !noStyle,
          })}
        >
          {daysLeft}
        </span>{' '}
        <FormattedMessage
          id="count.daysLeft"
          values={{
            count: daysLeft,
          }}
        />
      </span>
    )

    if (daysLeft === 0 && hoursLeft === 0 && minutesLeft !== 0) {
      timeLeft = (
        <span>
          <span className="excerpt_dark">{minutesLeft}</span>{' '}
          <FormattedMessage
            id="count.minutesLeft"
            values={{
              count: minutesLeft,
            }}
          />
        </span>
      )
    }

    if (daysLeft === 0 && hoursLeft !== 0 && minutesLeft !== 0) {
      timeLeft = (
        <span>
          <span className="excerpt_dark">{hoursLeft}</span>{' '}
          <FormattedMessage
            id="count.hoursLeft"
            values={{
              count: hoursLeft,
            }}
          />
        </span>
      )
    }

    return timeLeft
  }
}
export default RemainingTime
