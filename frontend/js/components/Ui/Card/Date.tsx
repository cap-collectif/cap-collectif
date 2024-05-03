import * as React from 'react'
import { FormattedMessage, FormattedDate } from 'react-intl'

import styled from 'styled-components'
import moment from 'moment'
import colors from '~/utils/colors'
import Icon, { ICON_NAME } from '~ui/Icons/Icon'
import IconRounded from '~ui/Icons/IconRounded'

type Props = {
  date: string
  children?: JSX.Element | JSX.Element[] | string
  fontSize: string
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

const Date = ({ date, children, fontSize }: Props) => {
  const isToday = moment(date).isSame(moment(), 'day')
  return (
    <Container>
      <IconRounded size={18} color={colors.darkGray}>
        <Icon name={ICON_NAME.calendar} size={10} color="#fff" />
      </IconRounded>
      <span className="date" style={{ fontSize }}>
        {isToday ? (
          <FormattedMessage id="today" />
        ) : (
          <FormattedDate
            value={moment(date)}
            day="numeric"
            month="long"
            year="numeric"
            hour="numeric"
            minute="numeric"
          />
        )}
      </span>
      {children}
    </Container>
  )
}

export default Date
