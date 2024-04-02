import * as React from 'react'
import { connect } from 'react-redux'
import type { RelayRefetchProp } from 'react-relay'
import { createRefetchContainer, graphql } from 'react-relay'
import Loader from '../../Ui/FeedbacksIndicators/Loader'
import type { GlobalState } from '../../../types'
import type { ProjectListView_query$data } from '~relay/ProjectListView_query.graphql'
import ProjectListViewPaginated from './ProjectListViewPaginated'
import { selector } from './Filters/ProjectListFilters'
import type {
  ProjectListViewRefetchQuery$variables,
  ProjectOrderField,
  ProjectArchiveFilter,
} from '~relay/ProjectListViewRefetchQuery.graphql'
type Props = {
  query: ProjectListView_query$data
  orderBy: ProjectOrderField
  author: string | null | undefined
  type: string | null | undefined
  theme: string | null | undefined
  district: string | null | undefined
  term: string | null | undefined
  status: string | null | undefined
  limit: number
  paginate: boolean
  relay: RelayRefetchProp
  isProjectsPage: boolean
  archived: ProjectArchiveFilter
}
type State = {
  isRefetching: boolean
}
export class ProjectListView extends React.Component<Props, State> {
  state = {
    isRefetching: false,
  }

  componentDidUpdate(prevProps: Props) {
    const { district, status, theme, term, orderBy, author, type, archived } = this.props

    if (
      prevProps.orderBy !== orderBy ||
      prevProps.author !== author ||
      prevProps.type !== type ||
      prevProps.district !== district ||
      prevProps.theme !== theme ||
      prevProps.status !== status ||
      prevProps.term !== term ||
      prevProps.archived !== archived
    ) {
      this._refetch()
    }
  }

  _refetch = () => {
    const { district, theme, relay, term, orderBy, author, status, type, archived } = this.props
    this.setState({
      isRefetching: true,
    })

    const refetchVariables = () =>
      ({
        orderBy: {
          field: orderBy,
          direction: 'DESC',
        },
        author,
        type,
        district,
        theme,
        term,
        status,
        archived,
      } as ProjectListViewRefetchQuery$variables)

    relay.refetch(
      refetchVariables,
      null,
      () => {
        this.setState({
          isRefetching: false,
        })
      },
      {
        force: true,
      },
    )
  }

  render() {
    const { query, limit, paginate, isProjectsPage } = this.props
    const { isRefetching } = this.state

    if (isRefetching) {
      return <Loader />
    }

    return <ProjectListViewPaginated query={query} limit={limit} paginate={paginate} isProjectsPage={isProjectsPage} />
  }
}

const mapStateToProps = (state: GlobalState) => ({
  orderBy: state.project.orderBy || 'PUBLISHED_AT',
  author: selector(state, 'author'),
  theme: selector(state, 'theme'),
  type: selector(state, 'type'),
  district: selector(state, 'district'),
  status: selector(state, 'status'),
  archived: selector(state, 'archived'),
  term: state.project.term,
})

const container = connect(mapStateToProps)(ProjectListView)
export default createRefetchContainer(
  container,
  {
    query: graphql`
      fragment ProjectListView_query on Query
      @argumentDefinitions(
        author: { type: "ID" }
        count: { type: "Int" }
        cursor: { type: "String" }
        theme: { type: "ID" }
        orderBy: { type: "ProjectOrder" }
        type: { type: "ID" }
        district: { type: "ID" }
        status: { type: "ID" }
        term: { type: "String" }
        onlyPublic: { type: "Boolean" }
        archived: { type: "ProjectArchiveFilter" }
      ) {
        ...ProjectListViewPaginated_query
          @arguments(
            theme: $theme
            orderBy: $orderBy
            cursor: $cursor
            type: $type
            district: $district
            author: $author
            term: $term
            count: $count
            status: $status
            onlyPublic: $onlyPublic
            archived: $archived
          )
      }
    `,
  },
  graphql`
    query ProjectListViewRefetchQuery(
      $author: ID
      $count: Int
      $cursor: String
      $theme: ID
      $orderBy: ProjectOrder
      $type: ID
      $district: ID
      $status: ID
      $term: String
      $onlyPublic: Boolean
      $archived: ProjectArchiveFilter
    ) {
      ...ProjectListView_query
        @arguments(
          theme: $theme
          orderBy: $orderBy
          cursor: $cursor
          author: $author
          type: $type
          district: $district
          term: $term
          count: $count
          status: $status
          onlyPublic: $onlyPublic
          archived: $archived
        )
    }
  `,
)
