import * as React from 'react'
import { graphql, GraphQLTaggedNode, useLazyLoadQuery } from 'react-relay'
import { useAppContext } from '../AppProvider/App.context'
import type { EventListQuery as EventListQueryType } from '@relay/EventListQuery.graphql'
import EventListPage from './EventListPage'

export const QUERY: GraphQLTaggedNode = graphql`
  query EventListQuery(
    $count: Int!
    $cursor: String
    $term: String
    $affiliations: [EventAffiliation!]
    $status: EventStatus
    $orderBy: EventOrder
  ) {
    viewer {
      ...EventListPage_viewer
      ...EventListPage_eventOwner
        @arguments(
          count: $count
          cursor: $cursor
          term: $term
          affiliations: $affiliations
          orderBy: $orderBy
          status: $status
        )
      organizations {
        ...EventListPage_eventOwner
          @arguments(
            count: $count
            cursor: $cursor
            term: $term
            affiliations: $affiliations
            orderBy: $orderBy
            status: $status
          )
      }
    }
  }
`

const EventListQuery: React.FC = () => {
  const { viewerSession } = useAppContext()
  const query = useLazyLoadQuery<EventListQueryType>(QUERY, {
    count: 50,
    cursor: null,
    term: null,
    affiliations: viewerSession.isAdmin ? null : ['OWNER'],
    orderBy: { field: 'START_AT', direction: 'DESC' },
    status: null,
  })
  const { viewer } = query
  const organization = viewer.organizations?.[0]

  return <EventListPage viewer={viewer} eventOwner={organization ?? viewer} />
}

export default EventListQuery
