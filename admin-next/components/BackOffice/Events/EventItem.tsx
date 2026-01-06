import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import type { EventItem_event$key } from '@relay/EventItem_event.graphql'
import { EventItem_viewer$key } from '@relay/EventItem_viewer.graphql'
import {
  ButtonQuickAction,
  CapUIFontSize,
  CapUIIcon,
  CapUIIconSize,
  Flex,
  Link,
  Table,
  Text,
  Tooltip,
} from '@cap-collectif/ui'
import downloadCSV from '@utils/download-csv'
import EventModalConfirmationDeleteQuery from './EventModalConfirmationDelete'

type Props = {
  event: EventItem_event$key
  viewer: EventItem_viewer$key
  isAdminOrganization?: boolean
}

const FRAGMENT = graphql`
  fragment EventItem_event on Event {
    enabled
    id
    title
    reviewStatus
    deletedAt
    projects {
      id
      title
      url
    }
    themes {
      id
      title
      url
    }
    timeRange {
      startAt
      endAt
    }
    createdAt
    owner {
      username
    }
    creator {
      id
      username
      url
    }
    guestListEnabled
    exportParticipantsUrl
    ...EventModalConfirmationDelete_event
  }
`

const VIEWER_FRAGMENT = graphql`
  fragment EventItem_viewer on User {
    id
    isOnlyProjectAdmin
    isAdmin
    isAdminOrganization
    isSuperAdmin
    organizations {
      id
    }
  }
`

const EventItem: React.FC<Props> = ({ event: eventFragment, viewer: viewerFragment }) => {
  const event = useFragment(FRAGMENT, eventFragment)
  const viewer = useFragment(VIEWER_FRAGMENT, viewerFragment)
  const { isAdmin, isAdminOrganization } = viewer
  const intl = useIntl()
  const project = event.projects[0]
  const viewerBelongsToAnOrganization = (viewer.organizations?.length ?? 0) > 0
  const canDelete = viewerBelongsToAnOrganization
    ? viewer?.isAdminOrganization || viewer.id === event.creator?.id
    : true

  const url = `/admin-next/event?id=${event.id}`

  return (
    <>
      <Table.Td>
        {event.reviewStatus === 'DELETED' ? (
          event.title && event.title?.split('').length > 128 ? (
            <Tooltip label={event.title}>
              <Text truncate={128}>{event.title}</Text>
            </Tooltip>
          ) : (
            <Text truncate={128}>{event.title}</Text>
          )
        ) : event.title && event.title?.split('').length > 128 ? (
          <Tooltip label={event.title}>
            <Link truncate={128} href={url}>
              {event.title}
            </Link>
          </Tooltip>
        ) : (
          <Link truncate={128} href={url}>
            {event.title}
          </Link>
        )}
      </Table.Td>
      <Table.Td>
        <Flex direction="column">
          {project && project.title && project.url && <Link href={project.url}>{project.title}</Link>}
          <Flex direction="row" color="gray.500">
            {event.themes.length > 0 &&
              event.themes.map((theme, index) => {
                if (theme && theme.title && theme.url) {
                  if (index + 1 < event.themes.length) {
                    return (
                      <React.Fragment key={theme.id}>
                        <Link href={theme?.url}>{theme?.title}</Link>
                        <span>, &nbsp; </span>
                      </React.Fragment>
                    )
                  }
                  return (
                    <Link key={theme.id} href={theme?.url}>
                      {theme?.title}
                    </Link>
                  )
                }
              })}
          </Flex>
        </Flex>
      </Table.Td>
      <Table.Td>
        {event.timeRange && (
          <Text fontSize={CapUIFontSize.BodyRegular}>
            {event.timeRange.startAt &&
              intl.formatDate(event.timeRange.startAt, {
                day: 'numeric',
                month: 'numeric',
                year: 'numeric',
              })}{' '}
            -{' '}
            {event.timeRange.endAt &&
              intl.formatDate(event.timeRange.endAt, {
                day: 'numeric',
                month: 'numeric',
                year: 'numeric',
              })}
          </Text>
        )}
      </Table.Td>
      <Table.Td>
        {event?.creator?.url && event?.creator?.username && (
          <Link key={event?.creator?.id} href={event?.creator?.url}>
            {event?.creator?.username}
          </Link>
        )}
      </Table.Td>
      {isAdmin || isAdminOrganization ? (
        <Table.Td>{event.owner && <Text fontSize={CapUIFontSize.BodyRegular}>{event.owner.username}</Text>}</Table.Td>
      ) : null}
      <Table.Td>
        {event.enabled && event.createdAt
          ? intl.formatDate(event.createdAt, {
              day: 'numeric',
              month: 'numeric',
              year: 'numeric',
            })
          : intl.formatMessage({ id: 'global.no.published' })}
      </Table.Td>
      <Table.Td>
        <Flex direction="row" justify="space-evenly" gap={2}>
          {!!event.exportParticipantsUrl && event.guestListEnabled && (
            <ButtonQuickAction
              icon={CapUIIcon.Download}
              size={CapUIIconSize.Md}
              variantColor="primary"
              label={intl.formatMessage({ id: 'global.download' })}
              href={event?.exportParticipantsUrl || ''}
              onClick={async () => {
                if (event.exportParticipantsUrl) {
                  await downloadCSV(event.exportParticipantsUrl, intl)
                }
              }}
            />
          )}
          {event.deletedAt === null && canDelete && <EventModalConfirmationDeleteQuery event={event} />}
        </Flex>
      </Table.Td>
    </>
  )
}

export default EventItem
