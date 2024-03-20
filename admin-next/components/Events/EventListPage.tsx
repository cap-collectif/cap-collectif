import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, GraphQLTaggedNode, useFragment } from 'react-relay'
import { Flex, Search, Button, InlineSelect, CapUIIcon } from '@cap-collectif/ui'
import EventList from './EventList'
import EventListNoResult from './EventListNoResult'
import { EventListPage_viewer$key } from '@relay/EventListPage_viewer.graphql'
import { EventListPage_eventOwner$key } from '@relay/EventListPage_eventOwner.graphql'
import debounce from '@utils/debounce-promise'
import downloadCSV from '@utils/download-csv'
import TablePlaceholder from '@ui/Table/TablePlaceholder'
import EventImportModal from './EventImportModal'

type EventListPageProps = {
  readonly viewer: EventListPage_viewer$key
  readonly eventOwner: EventListPage_eventOwner$key
}

export const FRAGMENT: GraphQLTaggedNode = graphql`
  fragment EventListPage_eventOwner on EventOwner
  @argumentDefinitions(
    count: { type: "Int!" }
    cursor: { type: "String" }
    term: { type: "String", defaultValue: null }
    affiliations: { type: "[EventAffiliation!]" }
    orderBy: { type: "EventOrder" }
    status: { type: "EventStatus" }
  ) {
    allEvents: events(affiliations: $affiliations) {
      totalCount
    }
    awaiting: events(status: AWAITING, affiliations: $affiliations) {
      totalCount
    }
    approved: events(status: APPROVED, affiliations: $affiliations) {
      totalCount
    }
    refused: events(status: REFUSED, affiliations: $affiliations) {
      totalCount
    }
    deleted: events(status: DELETED, affiliations: $affiliations) {
      totalCount
    }
    ...EventList_eventOwner
      @arguments(
        count: $count
        cursor: $cursor
        term: $term
        affiliations: $affiliations
        status: $status
        orderBy: $orderBy
      )
  }
`

const VIEWER_FRAGMENT = graphql`
  fragment EventListPage_viewer on User {
    isAdmin
    ...EventList_viewer
  }
`

const EventListPage: React.FC<EventListPageProps> = ({ viewer: viewerFragment, eventOwner: eventOwnerFragment }) => {
  const intl = useIntl()
  const [term, setTerm] = React.useState('')
  const [status, setStatus] = React.useState<string>('ALL')
  const viewer = useFragment(VIEWER_FRAGMENT, viewerFragment)
  const eventOwner = useFragment<EventListPage_eventOwner$key>(FRAGMENT, eventOwnerFragment)

  const onTermChange = debounce((value: string) => setTerm(value), 400)

  const eventsCount = eventOwner.allEvents.totalCount

  const exportEvents = async () => {
    await downloadCSV('/events/download', intl)
  }

  return (
    <Flex direction="column" spacing={6}>
      {eventsCount > 0 ? (
        <Flex direction="column" p={8} spacing={4} m={6} bg="white" borderRadius="normal" overflow="hidden">
          <Flex direction="row" justify="space-between">
            <Flex direction="row">
              <Button
                className="event_list_create"
                variant="primary"
                variantColor="primary"
                variantSize="small"
                leftIcon={CapUIIcon.Add}
                onClick={() => window.open('/admin/capco/app/event/create', '_self')}
                mr={6}
              >
                {intl.formatMessage({ id: 'admin-create-event' })}
              </Button>
              <Search
                id="search-event"
                onChange={onTermChange}
                value={term}
                placeholder={intl.formatMessage({ id: 'search.event' })}
              />
            </Flex>
            <Flex direction="row">
              <EventImportModal />
              {viewer.isAdmin && (
                <Button variant="secondary" variantColor="primary" variantSize="small" onClick={() => exportEvents()}>
                  {intl.formatMessage({ id: 'global.export' })}
                </Button>
              )}
            </Flex>
          </Flex>
          <InlineSelect
            onChange={value => {
              if (value) {
                setStatus(value)
              }
            }}
            value={status}
          >
            <InlineSelect.Choice value="ALL">
              {intl.formatMessage({ id: 'event.filter.all' }, { number: eventsCount })}
            </InlineSelect.Choice>
            {viewer.isAdmin && (
              <>
                <InlineSelect.Choice value="AWAITING">
                  {intl.formatMessage({ id: 'event.filter.waiting' }, { number: eventOwner.awaiting.totalCount })}
                </InlineSelect.Choice>
                <InlineSelect.Choice value="APPROVED">
                  {intl.formatMessage({ id: 'event.filter.approved' }, { number: eventOwner.approved.totalCount })}
                </InlineSelect.Choice>
                <InlineSelect.Choice value="REFUSED">
                  {intl.formatMessage({ id: 'events.filter.refused' }, { number: eventOwner.refused.totalCount })}
                </InlineSelect.Choice>
              </>
            )}
            <InlineSelect.Choice value="DELETED">
              {intl.formatMessage({ id: 'event.filter.deleted' }, { number: eventOwner.deleted.totalCount })}
            </InlineSelect.Choice>
          </InlineSelect>
          <React.Suspense fallback={<TablePlaceholder rowsCount={20} columnsCount={5} />}>
            <EventList
              viewer={viewer}
              eventOwner={eventOwner}
              term={term}
              resetFilters={() => {
                setTerm('')
                setStatus('ALL')
              }}
              status={status}
            />
          </React.Suspense>
        </Flex>
      ) : (
        <EventListNoResult />
      )}
    </Flex>
  )
}

export default EventListPage
