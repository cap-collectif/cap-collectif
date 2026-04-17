'use client'

import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import {
  ProjectPageEventsTab_project$data,
  ProjectPageEventsTab_project$key,
} from '@relay/ProjectPageEventsTab_project.graphql'
import moment from 'moment'
import {
  Box,
  CapUIIcon,
  Card,
  CardContent,
  CardCover,
  CardCoverImage,
  CardCoverPlaceholder,
  CardTagLabel,
  CardTagLeftIcon,
  CardTagList,
  CardTag,
  Flex,
  Tag,
} from '@cap-collectif/ui'
import { pxToRem } from '@shared/utils/pxToRem'
import { useIntl } from 'react-intl'

const FRAGMENT = graphql`
  fragment ProjectPageEventsTab_project on Project {
    steps {
      events(first: 100) {
        edges {
          node {
            id
            title
            url
            timeRange {
              startAt
              endAt
            }
            googleMapsAddress {
              formatted
            }
            themes {
              id
              title
            }
            media {
              url
            }
            guestListEnabled
            isEventRegistrationComplete
            isMeasurable
            availableRegistration
          }
        }
      }
    }
  }
`

type Props = {
  project: ProjectPageEventsTab_project$key
}

type EventNode = NonNullable<
  NonNullable<ProjectPageEventsTab_project$data['steps'][number]['events']['edges']>[number]
>['node']

const formatDateRange = (startAt: string | null | undefined, endAt: string | null | undefined): string => {
  if (!startAt) return ''
  const start = moment(startAt)
  if (!endAt) return start.format('D MMMM YYYY')
  const end = moment(endAt)
  if (start.isSame(end, 'month')) return `Du ${start.format('D')} au ${end.format('D MMMM')}`
  return `Du ${start.format('D MMMM')} au ${end.format('D MMMM')}`
}

const EventCard: React.FC<{ event: EventNode }> = ({ event }) => {
  const intl = useIntl()

  const renderStatusTag = () => {
    if (!event.guestListEnabled) return null
    if (event.isEventRegistrationComplete) {
      return <Tag variantColor="infoGray">{intl.formatMessage({ id: 'event.full' })}</Tag>
    }
    if (event.isMeasurable && event.availableRegistration != null) {
      return (
        <Tag variantColor="warning">
          {intl.formatMessage({ id: 'remaining-places' }, { count: event.availableRegistration })}
        </Tag>
      )
    }
    return <Tag variantColor="success">{intl.formatMessage({ id: 'registration.open' })}</Tag>
  }

  const statusTag = renderStatusTag()

  return (
    <Card format="horizontal">
      <CardCover>
        <Box position="relative" width="100%" height="100%">
          {event.media?.url ? (
            <CardCoverImage src={event.media.url} />
          ) : (
            <CardCoverPlaceholder icon={CapUIIcon.FileO} color="primary.base" />
          )}
          {statusTag && (
            <Box position="absolute" top="xxs" left="xxs">
              {statusTag}
            </Box>
          )}
        </Box>
      </CardCover>
      <CardContent primaryInfo={event.title} href={event.url}>
        <CardTagList>
          {(event.timeRange.startAt || event.timeRange.endAt) && (
            <CardTag>
              <CardTagLeftIcon name={CapUIIcon.CalendarO} />
              <CardTagLabel>{formatDateRange(event.timeRange.startAt, event.timeRange.endAt)}</CardTagLabel>
            </CardTag>
          )}
          {event.googleMapsAddress?.formatted && (
            <CardTag>
              <CardTagLeftIcon name={CapUIIcon.PinO} />
              <CardTagLabel>{event.googleMapsAddress.formatted}</CardTagLabel>
            </CardTag>
          )}
          {event.themes.map(theme => (
            <CardTag key={theme.id}>
              <CardTagLeftIcon name={CapUIIcon.FolderO} />
              <CardTagLabel>{theme.title}</CardTagLabel>
            </CardTag>
          ))}
        </CardTagList>
      </CardContent>
    </Card>
  )
}

const ProjectPageEventsTab: React.FC<Props> = ({ project: projectRef }) => {
  const data = useFragment(FRAGMENT, projectRef)
  const events = data.steps.flatMap(step => step.events.edges?.flatMap(edge => (edge?.node ? [edge.node] : [])) ?? [])

  return (
    <Box maxWidth={pxToRem(1280)} mx="auto" px={['md', 'lg']} py="xl">
      <Flex direction="column" gap="lg">
        {events.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </Flex>
    </Box>
  )
}

export default ProjectPageEventsTab
