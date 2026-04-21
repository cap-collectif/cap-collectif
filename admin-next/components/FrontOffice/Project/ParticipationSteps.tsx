'use client'

import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import {
  Accordion,
  Box,
  Button,
  CapUIAccordionColor,
  CapUIFontSize,
  CapUIFontWeight,
  CapUIIcon,
  CapUIIconSize,
  CapUILineHeight,
  Card,
  CardContent,
  CardCover,
  CardCoverImage,
  CardTagList,
  Flex,
  Icon,
  Tag,
  Text,
} from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { ParticipationSteps_project$key } from '@relay/ParticipationSteps_project.graphql'
import stripHTML from '@shared/utils/stripHTML'
import { getSrcSet } from '@shared/ui/Image'

type Props = {
  project: ParticipationSteps_project$key
  isWide?: boolean
}

const FRAGMENT = graphql`
  fragment ParticipationSteps_project on Project {
    stepDisplayType
    steps {
      id
      title
      state
      url
      body
      cover {
        url
      }
      timeRange {
        remainingTime {
          days
          hours
        }
      }
    }
  }
`

const ParticipationSteps: React.FC<Props> = ({ project: projectKey, isWide = false }) => {
  const project = useFragment(FRAGMENT, projectKey)
  const intl = useIntl()

  const showStepsOrder = project.stepDisplayType === 'NUMBERED_LIST'

  if (!project.steps.length) return null

  const openedStepIds =
    project.steps.length === 1 && isWide
      ? [project.steps[0].id]
      : project.steps.filter(step => step.state === 'OPENED').map(step => step.id)

  const getStatusTag = (state: string) => {
    if (state === 'OPENED') {
      return (
        <Tag variantColor="success">
          <Tag.Label>{intl.formatMessage({ id: 'step.status.open.participation' })}</Tag.Label>
        </Tag>
      )
    }
    if (state === 'FUTURE') {
      return (
        <Tag variantColor="info">
          <Tag.LeftIcon name={CapUIIcon.CalendarO} />
          <Tag.Label>{intl.formatMessage({ id: 'step.status.future' })}</Tag.Label>
        </Tag>
      )
    }
    return (
      <Tag variantColor="infoGray">
        <Tag.Label>{intl.formatMessage({ id: 'step.status.closed' })}</Tag.Label>
      </Tag>
    )
  }

  const getRemainingTimeLabel = (remainingTime: { days?: number | null; hours?: number | null } | null | undefined) => {
    if (!remainingTime) return null
    if (remainingTime.days != null && remainingTime.days > 0) {
      return `${remainingTime.days} ${intl.formatMessage({ id: 'count.daysLeft' }, { count: remainingTime.days })}`
    }
    if (remainingTime.hours != null && remainingTime.hours > 0) {
      return `${remainingTime.hours} ${intl.formatMessage({ id: 'count.hoursLeft' }, { count: remainingTime.hours })}`
    }
    return null
  }

  return (
    <Box width="40%" alignSelf="stretch">
      <Box position={!isWide ? 'sticky' : undefined} top={!isWide ? 0 : undefined} py="lg">
        <Flex alignItems="center" justifyContent={!isWide ? 'center' : 'flex-start'} gap="xs" mb="md">
          <Icon name={CapUIIcon.UserO} size={CapUIIconSize.Xl} color="blue.500" />
          <Text
            as="h2"
            fontWeight={CapUIFontWeight.Semibold}
            fontSize={CapUIFontSize.Headline}
            lineHeight={CapUILineHeight.M}
          >
            {intl.formatMessage({ id: 'front.project.participation-steps.title' })}
          </Text>
        </Flex>
        <Accordion allowMultiple defaultAccordion={openedStepIds} color={CapUIAccordionColor.white}>
          {project.steps.map((step, index) => {
            const { id, cover, body, title, state, url } = step
            const remainingTimeLabel = getRemainingTimeLabel(step.timeRange.remainingTime)
            const strippedBody = body ? stripHTML(body) : null

            return (
              <Accordion.Item
                key={id}
                id={id}
                sx={{
                  '&[open]': {
                    boxShadow: 'small',
                  },
                }}
                _hover={{ boxShadow: 'small' }}
              >
                <Accordion.Button
                  fontWeight={CapUIFontWeight.Normal}
                  fontSize={CapUIFontSize.Headline}
                  lineHeight={CapUILineHeight.M}
                >
                  {showStepsOrder ? `${index + 1}. ` : ''}
                  {title}
                </Accordion.Button>
                <Accordion.Panel ml={0}>
                  <Card format={isWide ? 'horizontal' : 'vertical'}>
                    {cover?.url ? (
                      <CardCover>
                        <CardCoverImage {...getSrcSet(cover.url)} />
                        {getStatusTag(state)}
                      </CardCover>
                    ) : null}
                    <CardContent primaryInfo={title} secondaryInfo={strippedBody ?? undefined} href={url}>
                      <CardTagList>
                        <Button variant="primary" variantSize="medium" as="span">
                          {state === 'OPENED'
                            ? intl.formatMessage({ id: 'project.preview.action.participe' })
                            : intl.formatMessage({ id: 'global.access' })}
                        </Button>
                        {state === 'OPENED' && remainingTimeLabel && (
                          <Tag variantColor="infoGray" transparent>
                            <Tag.LeftIcon name={CapUIIcon.ClockO} />
                            <Tag.Label>{remainingTimeLabel}</Tag.Label>
                          </Tag>
                        )}
                      </CardTagList>
                    </CardContent>
                  </Card>
                </Accordion.Panel>
              </Accordion.Item>
            )
          })}
        </Accordion>
      </Box>
    </Box>
  )
}

export default ParticipationSteps
