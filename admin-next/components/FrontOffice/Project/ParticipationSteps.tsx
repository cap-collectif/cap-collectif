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
  CardTagList,
  Flex,
  Icon,
  Tag,
  Text,
} from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import { ParticipationSteps_project$key } from '@relay/ParticipationSteps_project.graphql'
import stripHTML from '@shared/utils/stripHTML'

type Props = {
  project: ParticipationSteps_project$key
  isWide?: boolean
}

const FRAGMENT = graphql`
  fragment ParticipationSteps_project on Project {
    steps {
      id
      title
      state
      url
      body
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

  /* TODO: Add real field when API is ready */
  const showStepsOrder = false

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
        <Accordion
          defaultAccordion={openedStepIds}
          allowMultiple
          color={CapUIAccordionColor.default}
          direction="column"
          gap="md"
        >
          {project.steps.map(step => {
            const remainingTimeLabel = getRemainingTimeLabel(step.timeRange.remainingTime)
            const strippedBody = step.body ? stripHTML(step.body) : null

            return (
              <Accordion.Item key={step.id} id={step.id} mt={0}>
                <Accordion.Button>
                  <Text
                    fontWeight={CapUIFontWeight.Normal}
                    fontSize={CapUIFontSize.Headline}
                    lineHeight={CapUILineHeight.M}
                  >
                    {/* TODO: display step position when position field is added to the Step GraphQL type */}
                    {showStepsOrder ? `${step.id + 1}. ` : ''}
                    {step.title}
                  </Text>
                </Accordion.Button>
                <Accordion.Panel ml={0}>
                  <Card format={isWide ? 'horizontal' : 'vertical'}>
                    <CardCover>
                      {/* TODO: display step cover image when media field is added to the Step GraphQL type */}
                      {getStatusTag(step.state)}
                    </CardCover>
                    <CardContent primaryInfo={step.title} secondaryInfo={strippedBody ?? undefined} href={step.url}>
                      <CardTagList>
                        <Button variant="primary" variantSize="medium" as="span">
                          {step.state === 'OPENED'
                            ? intl.formatMessage({ id: 'project.preview.action.participe' })
                            : intl.formatMessage({ id: 'global.access' })}
                        </Button>
                        {step.state === 'OPENED' && remainingTimeLabel && (
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
