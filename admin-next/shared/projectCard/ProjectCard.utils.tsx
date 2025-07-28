import * as React from 'react'
import type { IntlShape } from 'react-intl'
import 'react-intl'
import moment from 'moment'
import type { ProjectCardshared_project$data } from '@relay/ProjectCardshared_project.graphql'
import {
  Flex,
  Text,
  TagProps,
  Icon as DSIcon,
  CapUIIconSize,
  CapUIIcon,
  CardStatusTag,
  CardTagLeftIcon,
  CardTagLabel,
  CardTag,
  CardRestricted,
} from '@cap-collectif/ui'
import { formatNumber } from '@shared/utils/FormattedNumber'

export const formatCounter = (iconName: CapUIIcon, count: number, label: string) => (
  <CardTag srOnlyText={label}>
    <CardTagLeftIcon name={iconName} />
    <CardTagLabel>{formatNumber(count)}</CardTagLabel>
  </CardTag>
)

export const formatInfo = (iconName: CapUIIcon, text: string | null | undefined, archived: boolean, color?: string) => {
  if (!text) {
    return null
  }

  return (
    <Flex maxWidth="100%" direction="row" alignItems="center" mb={2} mr={2}>
      <DSIcon name={iconName} size={CapUIIconSize.Md} mr={1} />
      <Text
        as="span"
        css={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: archived ? '#777' : color,
        }}
      >
        {text}
      </Text>
    </Flex>
  )
}

export const renderTag = (project: ProjectCardshared_project$data, intl: IntlShape) => {
  const restrictedTag = () => <CardRestricted srOnlyText={intl.formatMessage({ id: 'restrictedaccess' })} />

  const tag = (icon: CapUIIcon | null, variant: TagProps['variantColor'], message: string, isRestricted?: boolean) => (
    <>
      <CardStatusTag variantColor={variant} mr={1}>
        {icon ? <CardTagLeftIcon name={icon || CapUIIcon.Add} /> : null}
        <CardTagLabel> {message}</CardTagLabel>
      </CardStatusTag>
      {isRestricted && restrictedTag()}
    </>
  )

  if (project.archived)
    return tag(
      null,
      'infoGray',
      intl.formatMessage({
        id: 'global-archived',
      }),
    )
  const isRestricted = project.visibility !== 'PUBLIC'
  const now = moment()
  const publishedTime = now.diff(moment(project.publishedAt), 'hours')

  if (project.status === 'UNKNOWN') return null
  if (project.status === 'FUTURE_WITHOUT_FINISHED_STEPS')
    return tag(
      CapUIIcon.CalendarO,
      'info',
      intl.formatMessage({
        id: 'step.status.future',
      }),
      isRestricted,
    )
  const isClosed = project.status === 'CLOSED'
  if (isClosed)
    return tag(
      null,
      'infoGray',
      intl.formatMessage({
        id: 'global.ended',
      }),
      isRestricted,
    )
  const hoursLeft = now.diff(moment(project.currentStep?.timeRange.endAt), 'hours')
  if (hoursLeft > -48 && project.currentStep)
    return tag(
      CapUIIcon.ClockO,
      'danger',
      `${-hoursLeft} ${intl.formatMessage(
        {
          id: 'count.hoursLeft',
        },
        {
          count: -hoursLeft,
        },
      )}`,
      isRestricted,
    )
  const daysLeft = now.diff(moment(project.currentStep?.timeRange.endAt), 'days')
  if (daysLeft > -7 && project.currentStep)
    return tag(
      CapUIIcon.ClockO,
      'warning',
      `${-daysLeft} ${intl.formatMessage(
        {
          id: 'count.daysLeft',
        },
        {
          count: -daysLeft,
        },
      )}`,
      isRestricted,
    )
  if (project.status === 'OPENED')
    return tag(
      CapUIIcon.HourglassO,
      'success',
      intl.formatMessage({
        id: 'global.in-progress',
      }),
      isRestricted,
    )
  if (project.status === 'OPENED_PARTICIPATION')
    return tag(
      CapUIIcon.BubbleO,
      'success',
      intl.formatMessage({
        id: 'step.status.open.participation',
      }),
      isRestricted,
    )
  if ((isRestricted && !isClosed && !(daysLeft > -7) && !(hoursLeft > -48) && !(publishedTime < 48)) || isRestricted)
    return restrictedTag()
}
