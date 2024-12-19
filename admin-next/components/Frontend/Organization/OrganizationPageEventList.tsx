import * as React from 'react'
import { graphql, usePaginationFragment } from 'react-relay'
import { useEffect } from 'react'
import { useIntl } from 'react-intl'
import type { OrganizationPageEventList_organization$key } from '@relay/OrganizationPageEventList_organization.graphql'
import EventCard from './EventCard'
import { Button, Flex } from '@cap-collectif/ui'

const FRAGMENT = graphql`
  fragment OrganizationPageEventList_organization on Organization
  @argumentDefinitions(count: { type: "Int!" }, cursor: { type: "String" }, isFuture: { type: "Boolean" })
  @refetchable(queryName: "OrganizationPageEventListPaginationQuery") {
    events(first: $count, after: $cursor, hideDeletedEvents: true, hideUnpublishedEvents: true, isFuture: $isFuture)
      @connection(key: "OrganizationPageEventList_events", filters: ["query", "orderBy", "isFuture"]) {
      edges {
        node {
          id
          ...EventCard_event
        }
      }
    }
  }
`
export type Props = {
  readonly organization: OrganizationPageEventList_organization$key
  readonly filter: string
}
export const OrganizationPageEventList = ({ organization, filter }: Props) => {
  const intl = useIntl()
  const { data, loadNext, hasNext, refetch } = usePaginationFragment(FRAGMENT, organization)

  useEffect(() => {
    filter === 'theme.show.status.future' ? refetch({ isFuture: true }) : refetch({ isFuture: false })
  }, [filter, refetch])

  if (!data) return null
  const { events } = data

  return (
    <>
      {events.edges?.filter(Boolean).map((edge, index) => (
        <EventCard event={edge?.node} key={index} mb={4} />
      ))}
      {hasNext ? (
        <Flex width="100%">
          <Button margin="auto" onClick={() => loadNext(3)} variant="tertiary">
            {intl.formatMessage({
              id: 'global.more',
            })}
          </Button>
        </Flex>
      ) : null}
    </>
  )
}
export default OrganizationPageEventList
