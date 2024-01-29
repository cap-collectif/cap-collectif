import * as React from 'react'
import type { RelayRefetchProp } from 'react-relay'
import { createRefetchContainer, graphql } from 'react-relay'
import { connect } from 'react-redux'
import { formValueSelector } from 'redux-form'
import { debounce } from 'lodash'
import Loader from '../../Ui/FeedbacksIndicators/Loader'
import EventListPaginated from './EventListPaginated'
import { graphqlError } from '../../../createRelayEnvironment'
import type { GlobalState } from '../../../types'
import type { EventRefetch_query } from '~relay/EventRefetch_query.graphql'
import type { EventOrder } from '~relay/HomePageEventsQuery.graphql'
import { getOrderBy, ORDER_TYPE } from '../Profile/EventListProfileRefetch'
import type { EventRefetchRefetchQueryVariables } from '~relay/EventRefetchRefetchQuery.graphql'
type Props = {
  readonly search: string | null | undefined
  readonly relay: RelayRefetchProp
  readonly query: EventRefetch_query
  readonly theme: string | null | undefined
  readonly district: string | null | undefined
  readonly project: string | null | undefined
  readonly userType: string | null | undefined
  readonly status: string | null | undefined
  readonly isRegistrable: string | null | undefined
  readonly author:
    | {
        value: string
      }
    | null
    | undefined
  readonly orderBy: EventOrder
  readonly formName: string
  readonly isAuthenticated: boolean
}
type State = {
  readonly isRefetching: boolean
  readonly hasRefetchError: boolean
}
export class EventRefetch extends React.Component<Props, State> {
  state = {
    isRefetching: false,
    hasRefetchError: false,
  }
  _refetch = debounce(() => {
    const { relay, search, project, theme, district, author, status, isRegistrable, userType, isAuthenticated } = this.props
    this.setState({
      isRefetching: true,
    })

    const refetchVariables = fragmentVariables =>
      ({
        count: fragmentVariables.count,
        cursor: null,
        search: search || null,
        theme: theme || null,
        district: district || null,
        project: project || null,
        userType: userType || null,
        isFuture: status === 'all' ? null : status === 'ongoing-and-future',
        author: author && author.value ? author.value : null,
        isRegistrable: (isRegistrable === 'all' || !isRegistrable) ? null : isRegistrable === 'yes',
        orderBy: status === 'finished' || status === 'all' ? getOrderBy(ORDER_TYPE.OLD) : getOrderBy(ORDER_TYPE.LAST),
        isAuthenticated,
      } as EventRefetchRefetchQueryVariables)

    relay.refetch(
      refetchVariables,
      null,
      error => {
        if (error) {
          this.setState({
            hasRefetchError: true,
          })
        }

        this.setState({
          isRefetching: false,
        })
      },
      {
        force: true,
      },
    )
  }, 500)

  componentDidUpdate(prevProps: Props) {
    const { search, project, theme, district, orderBy, author, status, isRegistrable, userType } = this.props

    if (
      prevProps.theme !== theme ||
      prevProps.district !== district ||
      prevProps.project !== project ||
      prevProps.search !== search ||
      prevProps.status !== status ||
      prevProps.userType !== userType ||
      prevProps.author !== author ||
      prevProps.isRegistrable !== isRegistrable ||
      prevProps.orderBy !== orderBy
    ) {
      const url = new URL(window.location.href)
      const searchParams = new URLSearchParams(window.location.search)

      if (theme) {
        searchParams.set('theme', theme)
      }

      if (district) {
        searchParams.set('district', district)
      }

      url.search = searchParams.toString()
      window.history.replaceState({}, '', url.toString())

      this._refetch()
    }
  }

  render() {
    const { query, formName } = this.props
    const { isRefetching, hasRefetchError } = this.state

    if (hasRefetchError) {
      return graphqlError
    }

    if (isRefetching) {
      return <Loader />
    }

    // @ts-expect-error Flow failed to infer redux's dispatch
    return <EventListPaginated query={query} formName={formName} />
  }
}

const mapStateToProps = (state: GlobalState) => {
  const selector = formValueSelector('EventPageContainer')
  return {
    isAuthenticated: !!state.user.user,
    theme: selector(state, 'theme'),
    district: selector(state, 'district'),
    project: selector(state, 'project'),
    search: selector(state, 'search'),
    userType: selector(state, 'userType'),
    status: selector(state, 'status'),
    author: selector(state, 'author'),
    isRegistrable: selector(state, 'isRegistrable'),
    orderBy: selector(state, 'orderBy'),
  }
}

// @ts-ignore
const container = connect<any, any>(mapStateToProps)(EventRefetch)
export default createRefetchContainer(
  container,
  {
    query: graphql`
      fragment EventRefetch_query on Query
      @argumentDefinitions(
        count: { type: "Int!" }
        cursor: { type: "String" }
        theme: { type: "ID" }
        district: { type: "ID"}
        project: { type: "ID" }
        locale: { type: "TranslationLocale" }
        search: { type: "String" }
        userType: { type: "ID" }
        isFuture: { type: "Boolean" }
        author: { type: "ID" }
        isRegistrable: { type: "Boolean" }
        orderBy: { type: "EventOrder" }
        isAuthenticated: { type: "Boolean!" }
      ) {
        ...EventListPaginated_query
          @arguments(
            cursor: $cursor
            count: $count
            theme: $theme
            district: $district
            project: $project
            locale: $locale
            search: $search
            userType: $userType
            isFuture: $isFuture
            author: $author
            isRegistrable: $isRegistrable
            orderBy: $orderBy
            isAuthenticated: $isAuthenticated
          )
      }
    `,
  },
  graphql`
    query EventRefetchRefetchQuery(
      $cursor: String
      $count: Int!
      $theme: ID
      $district: ID
      $project: ID
      $userType: ID
      $locale: TranslationLocale
      $search: String
      $isFuture: Boolean
      $author: ID
      $isRegistrable: Boolean
      $orderBy: EventOrder
      $isAuthenticated: Boolean!
    ) {
      ...EventRefetch_query
        @arguments(
          cursor: $cursor
          count: $count
          theme: $theme
          district: $district
          project: $project
          userType: $userType
          locale: $locale
          search: $search
          isFuture: $isFuture
          author: $author
          isRegistrable: $isRegistrable
          orderBy: $orderBy
          isAuthenticated: $isAuthenticated
        )
      events(
        first: $count
        after: $cursor
        theme: $theme
        district: $district
        project: $project
        locale: $locale
        search: $search
        userType: $userType
        isFuture: $isFuture
        author: $author
        isRegistrable: $isRegistrable
        orderBy: $orderBy
      ) @connection(key: "EventListPaginated_events", filters: []) {
        edges {
          node {
            id
          }
        }
        totalCount
      }
    }
  `,
)
