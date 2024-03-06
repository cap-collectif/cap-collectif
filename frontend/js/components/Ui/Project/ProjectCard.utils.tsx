import * as React from 'react'
import type { IntlShape } from 'react-intl'
import 'react-intl'
import moment from 'moment'
import css from '@styled-system/css'
import type { ProjectCard_project, StepState } from '~relay/ProjectCard_project.graphql'
import Flex from '~ui/Primitives/Layout/Flex'
import Text from '~ui/Primitives/Text'
import Icon, { ICON_NAME, ICON_SIZE } from '~ds/Icon/Icon'
import { LineHeight } from '~ui/Primitives/constants'
import type { TagVariant } from '~ds/Tag/Tag'
import Tag from '~ds/Tag/Tag'
import FormattedNumber from '~/components/Utils/FormattedNumber'
import colors from '~/styles/modules/colors'
type Steps = ReadonlyArray<{
  readonly state: StepState
  readonly __typename: string
}>
export const formatCounter = (iconName: string, count: number, archived: boolean) => (
  <Flex direction="row" alignItems="center">
    <Icon name={ICON_NAME[iconName]} size={ICON_SIZE.MD} color={archived ? 'gray.500' : 'gray.700'} mr={1} />
    <Text fontSize={14} color={archived ? 'gray.500' : 'gray.900'} as="div">
      <FormattedNumber number={count} />
    </Text>
  </Flex>
)
export const formatInfo = (iconName: string, text: string | null | undefined, archived: boolean, color?: string) => {
  if (!text) {
    return null
  }

  return (
    <Flex maxWidth="100%" direction="row" alignItems="center" mb={2} mr={2}>
      <Icon name={ICON_NAME[iconName]} size={ICON_SIZE.MD} mr={1} />
      <Text
        as="span"
        css={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: archived ? colors['neutral-gray']['400'] : color,
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

export const renderTag = (project: ProjectCard_project, intl: IntlShape) => {
  const restrictedTag = () => (
    <Tag
      variant="neutral-gray"
      css={css({
        p: {
          lineHeight: 1,
        },
      })}
    >
      <Icon name="LOCK" size={ICON_SIZE.SM} color="gray.700" />
    </Tag>
  )

  const tag = (variant: TagVariant, message: string, isRestricted?: boolean) => (
    <Flex
      top={[2, 4]}
      left={[2, 4]}
      css={css({
        position: 'absolute',
      })}
    >
      <Tag variant={variant} mr={1}>
        <Text as="span" fontSize={1} lineHeight={LineHeight.SM} fontWeight="700">
          {message}
        </Text>
      </Tag>
      {isRestricted && restrictedTag()}
    </Flex>
  )

  if (project.archived)
    return tag(
      'neutral-gray',
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
      'aqua',
      intl.formatMessage({
        id: 'step.status.future',
      }),
      isRestricted,
    )
  if (!project.currentStep) return null
  const isStepFinished = project.currentStep.state === 'CLOSED'
  if (isStepFinished)
    return tag(
      'neutral-gray',
      intl.formatMessage({
        id: 'global.ended',
      }),
      isRestricted,
    )
  const hoursLeft = now.diff(moment(project.currentStep?.timeRange.endAt), 'hours')
  if (hoursLeft > -48 && project.currentStep)
    return tag(
      'red',
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
      'orange',
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
      'green',
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
