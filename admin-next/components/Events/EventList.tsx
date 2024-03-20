import * as React from 'react'
import { graphql, useFragment, usePaginationFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import EventItem from './EventItem'
import { Table, Text, Icon, CapUIIcon } from '@cap-collectif/ui'
import EmptyMessage from '@ui/Table/EmptyMessage'
import { EventList_viewer$key } from '@relay/EventList_viewer.graphql'
import { EventList_eventOwner$key } from '@relay/EventList_eventOwner.graphql'
import { EventListQuery$variables } from '@relay/EventListQuery.graphql'
import { useLayoutContext } from 'components/Layout/Layout.context'
import { DeepWriteable } from 'types'

export const EVENT_LIST_PAGINATION = 20

export const EventListQuery = graphql`
  fragment EventList_eventOwner on EventOwner
  @argumentDefinitions(
    count: { type: "Int!" }
    cursor: { type: "String" }
    term: { type: "String", defaultValue: null }
    affiliations: { type: "[EventAffiliation!]" }
    orderBy: { type: "EventOrder" }
    status: { type: "EventStatus" }
  )
  @refetchable(queryName: "EventListPaginationQuery") {
    events(
      first: $count
      after: $cursor
      search: $term
      affiliations: $affiliations
      orderBy: $orderBy
      status: $status
    ) @connection(key: "EventList_events", filters: ["query", "orderBy", "status", "affiliations", "search"]) {
      __id
      totalCount
      edges {
        node {
          id
          ...EventItem_event
        }
      }
    }
  }
`

const VIEWER_FRAGMENT = graphql`
  fragment EventList_viewer on User {
    isAdmin
    isAdminOrganization
    ...EventItem_viewer
  }
`

type EventListProps = {
  viewer: EventList_viewer$key
  eventOwner: EventList_eventOwner$key
  term: string
  status: string | null
  resetFilters: () => void
}

export type EventAffiliations = DeepWriteable<EventListQuery$variables['affiliations']>

const EventList: React.FC<EventListProps> = ({ viewer: viewerRef, eventOwner, term, status, resetFilters }) => {
  const intl = useIntl()
  const viewer = useFragment<EventList_viewer$key>(VIEWER_FRAGMENT, viewerRef)
  const { isAdmin, isAdminOrganization } = viewer
  const { data, loadNext, hasNext, refetch } = usePaginationFragment(EventListQuery, eventOwner)
  const [orderBy, setOrderBy] = React.useState('DESC')
  const { events } = data
  const firstRendered = React.useRef<boolean | null>(null)
  const { contentRef } = useLayoutContext()
  const hasEvents = events ? events.totalCount > 0 : false
  const affiliations: EventAffiliations = React.useMemo(() => (isAdmin ? null : ['OWNER']), [isAdmin])

  React.useEffect(() => {
    if (firstRendered.current) {
      refetch({
        term: term || null,
        status: status !== 'ALL' ? status : null,
        affiliations,
        orderBy: { field: 'START_AT', direction: orderBy },
      })
    }
    firstRendered.current = true
  }, [term, isAdmin, refetch, orderBy, status, affiliations])

  return (
    <Table
      emptyMessage={
        <EmptyMessage
          onReset={() => {
            setOrderBy('DESC')
            resetFilters()
          }}
        />
      }
      style={{ border: 'none' }}
      onReset={() => {
        setOrderBy('DESC')
        resetFilters()
      }}
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'global.title' })} </Table.Th>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'global.participative.project' })}</Table.Th>
          <Table.Th lineHeight="sm">
            <Table.Menu label={intl.formatMessage({ id: 'start.date.and.end' })}>
              <Table.Menu.OptionGroup
                value={orderBy}
                onChange={setOrderBy}
                type="radio"
                title={intl.formatMessage({ id: 'sort-by' })}
              >
                <Table.Menu.OptionItem value="DESC">
                  <Text>{intl.formatMessage({ id: 'global.filter_last' })}</Text>
                  <Icon ml="auto" name={CapUIIcon.ArrowDownO} />
                </Table.Menu.OptionItem>

                <Table.Menu.OptionItem value="ASC">
                  <Text>{intl.formatMessage({ id: 'global.filter_old' })}</Text>
                  <Icon ml="auto" name={CapUIIcon.ArrowUpO} />
                </Table.Menu.OptionItem>
              </Table.Menu.OptionGroup>
            </Table.Menu>
          </Table.Th>
          {isAdmin && <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'admin.projects.list.author' })}</Table.Th>}
          <Table.Th>
            <Text lineHeight="sm">{intl.formatMessage({ id: 'admin.projects.list.author' })}</Text>
          </Table.Th>
          {isAdmin || isAdminOrganization ? (
            <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'global.owner' })}</Table.Th>
          ) : null}
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'global.updated.date' })}</Table.Th>
          <Table.Th />
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody
        useInfiniteScroll={hasEvents}
        onScrollToBottom={() => {
          loadNext(EVENT_LIST_PAGINATION)
        }}
        hasMore={hasNext}
        scrollParentRef={contentRef || undefined}
      >
        {events?.edges
          ?.filter(Boolean)
          .map(edge => edge?.node)
          .filter(Boolean)
          .map(
            event =>
              event && (
                <Table.Tr key={event.id} rowId={event.id}>
                  <EventItem event={event} affiliations={affiliations} viewer={viewer} />
                </Table.Tr>
              ),
          )}
      </Table.Tbody>
    </Table>
  )
}

export default EventList
