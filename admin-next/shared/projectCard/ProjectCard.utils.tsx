import * as React from 'react'
import type { IntlShape } from 'react-intl'
import 'react-intl'
import moment from 'moment'
import css from '@styled-system/css'
import type { ProjectCardshared_project$data, StepState } from '@relay/ProjectCardshared_project.graphql'
import {
  Flex,
  Text,
  Tag,
  TagProps,
  Icon as DSIcon,
  CapUIIconSize,
  CapUIIcon,
  CapUILineHeight,
  CapUIFontSize,
} from '@cap-collectif/ui'
import FormattedNumber from '@shared/utils/FormattedNumber'

type Steps = ReadonlyArray<{
  readonly state: StepState
  readonly __typename: string
}>

export const formatCounter = (iconName: CapUIIcon, count: number, archived: boolean, label: string) => (
  <Flex direction="row" alignItems="center">
    <DSIcon size={CapUIIconSize.Md} color={archived ? 'gray.500' : 'gray.700'} mr={1} name={iconName} />
    <Text fontSize={14} color={archived ? 'gray.500' : 'gray.900'} as="div">
      <FormattedNumber number={count} />
      <span className="sr-only">{label}</span>
    </Text>
  </Flex>
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

const getIsFutureStep = (steps: Steps): boolean => {
  const openedSteps = steps.filter(step => step.state === 'OPENED' && step.__typename !== 'PresentationStep')
  const futureSteps = steps.filter(step => step.state === 'FUTURE' && step.__typename !== 'PresentationStep')
  const closedSteps = steps.filter(step => step.state === 'CLOSED' && step.__typename !== 'PresentationStep')
  return futureSteps.length > 0 && openedSteps.length === 0 && closedSteps.length === 0
}

export const renderTag = (project: ProjectCardshared_project$data, intl: IntlShape) => {
  const restrictedTag = () => (
    <Tag
      variantColor="infoGray"
      css={css({
        p: {
          lineHeight: 1,
        },
      })}
    >
      <DSIcon size={CapUIIconSize.Sm} name={CapUIIcon.Lock} color="gray.700" />
    </Tag>
  )

  const tag = (variant: TagProps['variantColor'], message: string, isRestricted?: boolean) => (
    <Flex
      top={[2, 4]}
      left={[2, 4]}
      css={css({
        position: 'absolute',
      })}
    >
      <Tag variantColor={variant} mr={1}>
        <Text as="span" fontSize={CapUIFontSize.Caption} lineHeight={CapUILineHeight.S} fontWeight="700">
          {message}
        </Text>
      </Tag>
      {isRestricted && restrictedTag()}
    </Flex>
  )

  if (project.archived)
    return tag(
      'infoGray',
      intl.formatMessage({
        id: 'global-archived',
      }),
    )
  const isRestricted = project.visibility !== 'PUBLIC'
  const now = moment()
  const publishedTime = now.diff(moment(project.publishedAt), 'hours')
  const isFutureStep = project.steps ? getIsFutureStep(project.steps) : null
  if (isFutureStep)
    return tag(
      'info',
      intl.formatMessage({
        id: 'step.status.future',
      }),
      isRestricted,
    )
  if (!project.currentStep) return null
  const isStepFinished = project.currentStep.state === 'CLOSED'
  if (isStepFinished)
    return tag(
      'infoGray',
      intl.formatMessage({
        id: 'global.ended',
      }),
      isRestricted,
    )
  const hoursLeft = now.diff(moment(project.currentStep?.timeRange.endAt), 'hours')
  if (hoursLeft > -48 && project.currentStep)
    return tag(
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
  if (publishedTime < 48)
    return tag(
      'success',
      intl.formatMessage({
        id: 'global.new',
      }),
      isRestricted,
    )
  if (
    (isRestricted && !isStepFinished && !(daysLeft > -7) && !(hoursLeft > -48) && !(publishedTime < 48)) ||
    isRestricted
  )
    return (
      <Flex
        top={[2, 4]}
        left={[2, 4]}
        css={css({
          position: 'absolute',
        })}
      >
        {restrictedTag()}
      </Flex>
    )
}
