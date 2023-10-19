import * as React from 'react'
import type { RelayPaginationProp } from 'react-relay'
import { graphql, createPaginationContainer } from 'react-relay'
import { FormattedMessage } from 'react-intl'
import { Button } from 'react-bootstrap'
import LeafletMap from './LeafletMap'
import type { EventMap_query } from '~relay/EventMap_query.graphql'

type Props = {
  query: EventMap_query
  relay: RelayPaginationProp
}
type State = {
  loading: boolean
}
const PAGINATION = 50
export class EventMap extends React.Component<Props, State> {
  state = {
    loading: false,
  }

  loadMore = () => {
    const { relay, query } = this.props

    if (!query.events.pageInfo.hasNextPage) {
      this.setState({
        loading: false,
      })
      return
    }

    relay.loadMore(PAGINATION, () => {
      this.loadMore()
    })
  }

  loadAll = () => {
    this.setState({
      loading: true,
    })
    this.loadMore()
  }

  render() {
    const { relay, query } = this.props
    const { loading } = this.state
    return (
      <div
        style={{
          position: 'relative',
        }}
      >
        {relay.hasMore() && !loading && (
          <Button
            style={{
              position: 'absolute',
              marginLeft: '5%',
              top: '85%',
              zIndex: '1500',
              width: '90%',
            }}
            onClick={this.loadAll}
          >
            <FormattedMessage id="see-more-events" />
          </Button>
        )}
        <LeafletMap
          loading={loading}
          query={query}
          defaultMapOptions={{
            zoom: 12,
          }}
        />
      </div>
    )
  }
}
export default createPaginationContainer(
  EventMap,
  {
    query: graphql`
      fragment EventMap_query on Query
      @argumentDefinitions(
        count: { type: "Int!" }
        cursor: { type: "String" }
        theme: { type: "ID" }
        project: { type: "ID" }
        locale: { type: "TranslationLocale" }
        search: { type: "String" }
        userType: { type: "ID" }
        isFuture: { type: "Boolean" }
        author: { type: "ID" }
        isRegistrable: { type: "Boolean" }
        orderBy: { type: "EventOrder" }
      ) {
        events(
          first: $count
          after: $cursor
          theme: $theme
          project: $project
          locale: $locale
          search: $search
          userType: $userType
          isFuture: $isFuture
          author: $author
          isRegistrable: $isRegistrable
          orderBy: $orderBy
        ) @connection(key: "EventMap_events", filters: []) {
          pageInfo {
            hasNextPage
            endCursor
            hasPreviousPage
            startCursor
          }
          edges {
            node {
              id
            }
          }
        }
        ...LeafletMap_query
          @arguments(
            count: $count
            cursor: $cursor
            theme: $theme
            project: $project
            locale: $locale
            search: $search
            userType: $userType
            isFuture: $isFuture
            author: $author
            isRegistrable: $isRegistrable
            orderBy: $orderBy
          )
      }
    `,
  },
  {
    direction: 'forward',

    getConnectionFromProps(props: Props) {
      return props.query && props.query.events
    },

    getFragmentVariables(prevVars) {
      return { ...prevVars }
    },

    getVariables(props: Props, { count, cursor }, fragmentVariables) {
      return { ...fragmentVariables, count, cursor }
    },

    query: graphql`
      query EventMapPaginatedQuery(
        $cursor: String
        $count: Int!
        $theme: ID
        $project: ID
        $locale: TranslationLocale
        $search: String
        $userType: ID
        $isFuture: Boolean
        $author: ID
        $isRegistrable: Boolean
        $orderBy: EventOrder
      ) {
        ...EventMap_query
          @arguments(
            cursor: $cursor
            count: $count
            theme: $theme
            project: $project
            locale: $locale
            search: $search
            userType: $userType
            isFuture: $isFuture
            author: $author
            isRegistrable: $isRegistrable
            orderBy: $orderBy
          )
      }
    `,
  },
)
