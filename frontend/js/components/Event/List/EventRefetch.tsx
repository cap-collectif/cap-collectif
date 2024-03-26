import * as React from 'react'
import type { RelayRefetchProp } from 'react-relay'
import { createRefetchContainer, graphql } from 'react-relay'
import { connect } from 'react-redux'
import { formValueSelector } from 'redux-form'
import Loader from '../../Ui/FeedbacksIndicators/Loader'
import EventListPaginated from './EventListPaginated'
import { graphqlError } from '../../../createRelayEnvironment'
import type { GlobalState } from '../../../types'
import type { EventRefetch_query } from '~relay/EventRefetch_query.graphql'
import type { EventOrder } from '~relay/HomePageEventsQuery.graphql'

import type { EventRefetchRefetchQuery$variables } from '~relay/EventRefetchRefetchQuery.graphql'
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
  readonly isFuture: boolean | null | undefined
  readonly hide: boolean
  readonly hideMap: boolean
  readonly count: number
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
  _refetch = () => {
    const {
      relay,
      search,
      project,
      theme,
      district,
      author,
      isFuture,
      count,
      isRegistrable,
      userType,
      isAuthenticated,
      orderBy,
    } = this.props
    this.setState({
      isRefetching: true,
    })

    const refetchVariables = fragmentVariables =>
      ({
        count: count === undefined ? fragmentVariables.count : count,
        cursor: null,
        search: search || null,
        theme: theme || null,
        district: district || null,
        project: project || null,
        userType: userType || null,
        isFuture: isFuture,
        author: author && author.value ? author.value : null,
        isRegistrable: isRegistrable === 'all' || !isRegistrable ? null : isRegistrable === 'yes',
        orderBy: orderBy,
        isAuthenticated,
      } as EventRefetchRefetchQuery$variables)

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
  }

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
    const { query, formName, hide, hideMap } = this.props
    const { isRefetching, hasRefetchError } = this.state

    if (hasRefetchError) {
      return graphqlError
    }

    if (hide) return null

    if (isRefetching) {
      return <Loader />
    }

    return <EventListPaginated query={query} formName={formName} hideMap={hideMap} />
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
  }
}

// @ts-ignore
const container = connect(mapStateToProps)(EventRefetch)
export default createRefetchContainer(
  container,
  {
    query: graphql`
      fragment EventRefetch_query on Query
      @argumentDefinitions(
        count: { type: "Int!" }
        cursor: { type: "String" }
        theme: { type: "ID" }
        district: { type: "ID" }
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
      ) @connection(key: "EventListPaginated_events", filters: ["orderBy", "isFuture"]) {
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
