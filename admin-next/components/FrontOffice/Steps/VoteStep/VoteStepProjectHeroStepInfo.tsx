'use client'

import { Box, CapUIIcon, CapUIIconSize, Flex, Icon, InfoMessage, Text } from '@cap-collectif/ui'
import moment from 'moment'
import * as React from 'react'
import { FormattedDate, FormattedMessage, FormattedTime } from 'react-intl'

type Props = {
  state: string
  timeRange: { startAt?: string | null; endAt?: string | null }
}

const DateInterval: React.FC<Props['timeRange']> = ({ startAt, endAt }) => {
  const now = moment().toDate()
  const startDay = <FormattedDate value={moment(startAt).toDate()} day="numeric" month="long" year="numeric" />
  const startTime = <FormattedTime value={moment(startAt).toDate()} hour="numeric" minute="numeric" />
  const endDay = <FormattedDate value={moment(endAt).toDate()} day="numeric" month="long" year="numeric" />
  const endTime = <FormattedTime value={moment(endAt).toDate()} hour="numeric" minute="numeric" />

  if (startAt) {
    const startTimeValue = startAt.substr(11, 5)
    if (!endAt)
      return startTimeValue !== '00:00' ? (
        <FormattedMessage id="global.dates.full_day" values={{ date: startDay, time: startTime }} />
      ) : (
        <FormattedMessage id="global.dates.startDay.startNoTime" values={{ startD: startDay }} />
      )

    const endTimeValue = endAt.substr(11, 5)
    if (moment(endAt).diff(moment(startAt), 'days') < 1)
      return <FormattedMessage id="global.dates.part_day" values={{ date: startDay, startTime, endTime }} />
    if (endTimeValue !== '00:00' && startTimeValue !== '00:00')
      return (
        <FormattedMessage
          id="global.dates.full.days"
          values={{ startD: startDay, startT: startTime, endD: endDay, endT: endTime }}
        />
      )
    if (endTimeValue !== '00:00')
      return (
        <FormattedMessage
          id="global.dates.full.days.startNoTime"
          values={{ startD: startDay, endD: endDay, endT: endTime }}
        />
      )
    if (startTimeValue !== '00:00')
      return (
        <FormattedMessage
          id="global.dates.full.days.endNoTime"
          values={{ startD: startDay, startT: startTime, endD: endDay }}
        />
      )
    return <FormattedMessage id="global.dates.between" values={{ start: startDay, end: endDay }} />
  }

  if (endAt) {
    const endTimeValue = endAt.substr(11, 5)
    if (moment(endAt).diff(now, 'days') < 0)
      return <FormattedMessage id="global.dates.pastDate" values={{ endD: endDay }} />
    return endTimeValue !== '00:00' ? (
      <FormattedMessage id="global.dates.endDate" values={{ endD: endDay, endT: endTime }} />
    ) : (
      <FormattedMessage id="global.dates.endDate.endNoTime" values={{ endD: endDay }} />
    )
  }

  return null
}

const RemainingTime: React.FC<{ endAt: string }> = ({ endAt }) => {
  const endDate = moment(endAt)
  const now = moment()
  const daysLeft = endDate.diff(now, 'days')
  const hoursLeft = endDate.diff(now, 'hours')
  const minutesLeft = endDate.diff(now, 'minutes')

  if (daysLeft === 0 && hoursLeft === 0 && minutesLeft !== 0)
    return (
      <>
        {minutesLeft} <FormattedMessage id="count.minutesLeft" values={{ count: minutesLeft }} />
      </>
    )
  if (daysLeft === 0 && hoursLeft !== 0 && minutesLeft !== 0)
    return (
      <>
        {hoursLeft} <FormattedMessage id="count.hoursLeft" values={{ count: hoursLeft }} />
      </>
    )
  return (
    <>
      {daysLeft} <FormattedMessage id="count.daysLeft" values={{ count: daysLeft }} />
    </>
  )
}

const VoteStepProjectHeroStepInfo: React.FC<Props> = ({ state, timeRange }) => {
  const hasDates = !!(timeRange.startAt || timeRange.endAt)
  const showRemainingTime = state === 'OPENED' && !!timeRange.endAt

  if (state !== 'CLOSED' && !hasDates) return null

  return (
    <Box width="100%" marginTop={4} aria-label="step-information">
      {state === 'CLOSED' ? (
        <InfoMessage variant="info" marginBottom={4}>
          <InfoMessage.Title>
            <FormattedMessage id="step.selection.alert.ended.title" />
          </InfoMessage.Title>
          <InfoMessage.Content>
            <FormattedMessage id="thank.for.contribution" />
          </InfoMessage.Content>
        </InfoMessage>
      ) : null}
      {state === 'FUTURE' && timeRange.startAt ? (
        <InfoMessage variant="info" marginBottom={4}>
          <InfoMessage.Title>
            <FormattedMessage id="step.collect.alert.future.title" />
          </InfoMessage.Title>
          <InfoMessage.Content>
            <FormattedMessage
              id="step.start.future"
              values={{ date: <FormattedDate value={moment(timeRange.startAt).toDate()} /> }}
            />
          </InfoMessage.Content>
        </InfoMessage>
      ) : null}
      {hasDates ? (
        <Flex alignItems="center" flexWrap="wrap" gap={4}>
          <Flex alignItems="center" gap={1}>
            <Icon name={CapUIIcon.CalendarO} size={CapUIIconSize.Md} />
            <Text className="platform__body">
              <DateInterval {...timeRange} />
            </Text>
          </Flex>
          {showRemainingTime ? (
            <Flex alignItems="center" gap={1}>
              <Icon name={CapUIIcon.HourglassO} size={CapUIIconSize.Md} />
              <Text className="platform__body">
                <RemainingTime endAt={timeRange.endAt!} />
              </Text>
            </Flex>
          ) : null}
        </Flex>
      ) : null}
    </Box>
  )
}

export default VoteStepProjectHeroStepInfo
