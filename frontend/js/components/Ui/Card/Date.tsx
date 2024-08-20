import * as React from 'react'
import { FormattedMessage, FormattedDate, useIntl } from 'react-intl'

import styled from 'styled-components'
import moment from 'moment'
import colors from '~/utils/colors'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import IconRounded from '@shared/ui/LegacyIcons/IconRounded'

type Props = {
  startDate: string
  endDate?: string | undefined | null
  children?: JSX.Element | JSX.Element[] | string
  fontSize?: string
}
export const Container = styled.div.attrs({
  className: 'card__date',
})<{ fontSize?: string }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;

  .date {
    margin: 0;
    font-size: ${props => props.fontSize};
  }
`

const Date = ({ startDate, children, endDate = null, fontSize = 'unset' }: Props) => {
  const intl = useIntl()

  const startsToday = moment(startDate).isSame(moment(), 'day')
  const endsToday = moment(endDate).isSame(moment(), 'day')
  const isLongerThanAYear: number | typeof NaN = moment(endDate).diff(moment(startDate), 'year')

  const getDurationText = (startDate: string, endDate: string | null) => {
    // Event starts & ends today
    // or event starts today and does not have an endDate
    // "Today at (hour) (minute)"
    if ((startsToday && endsToday) || (startsToday && !endDate)) {
      return (
        <>
          <FormattedMessage id="today" /> {intl.formatMessage({ id: 'global.at' })}{' '}
          <DateElement date={startDate} content="hour" />
        </>
      )
    }

    // Event does not have and endDate
    // "(day) (month)"
    if (!endDate) {
      return <DateElement date={startDate} content="day" />
    }

    // Event is longer than a year
    // "from (day) (month) (year) to (day) (month) (year)"
    if (isLongerThanAYear) {
      return intl.formatMessage(
        {
          id: 'fromDayToDay',
        },
        {
          day: intl.formatDate(startDate, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
          anotherDay: intl.formatDate(endDate, {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
        },
      )
    }

    // Default:
    // "from (day) (month) to (day) (month)"
    return intl.formatMessage(
      {
        id: 'fromDayToDay',
      },
      {
        day: intl.formatDate(startDate, {
          day: 'numeric',
          month: 'short',
        }),
        anotherDay: intl.formatDate(endDate, {
          day: 'numeric',
          month: 'short',
        }),
      },
    )
  }

  return (
    <Container>
      <IconRounded size={18} color={colors.darkGray}>
        <Icon name={ICON_NAME.calendar} size={10} color="#fff" />
      </IconRounded>
      <span className="date" style={{ fontSize }}>
        {getDurationText(startDate, endDate)}
      </span>
      {children}
    </Container>
  )
}

export default Date

type DateElementProps = {
  date: string
  content: 'day' | 'year' | 'hour'
}

const DateElement = ({ date, content }: DateElementProps) => {
  const momentDateToJsDate = (date: string): Date => {
    return moment(date).toDate()
  }
  if (content === 'day') {
    return <FormattedDate value={momentDateToJsDate(date)} day="numeric" month="long" />
  }
  if (content === 'year') {
    return <FormattedDate value={momentDateToJsDate(date)} year="numeric" />
  }
  if (content === 'hour') {
    return <FormattedDate value={momentDateToJsDate(date)} hour="numeric" minute="numeric" />
  }
}
