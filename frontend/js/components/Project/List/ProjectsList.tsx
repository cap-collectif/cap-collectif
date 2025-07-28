import React from 'react'
import { connect } from 'react-redux'
import { QueryRenderer, graphql } from 'react-relay'
import environment, { graphqlError } from '../../../createRelayEnvironment'
import type { ProjectsListQuery$data } from '~relay/ProjectsListQuery.graphql'
import type { GlobalState, FeatureToggles } from '../../../types'
import '../../../types'
import ProjectListView from './ProjectListView'
import { getInitialValues } from './Filters/ProjectListFilters'
import ProjectsListPlaceholder from './ProjectsListPlaceholder'
import type { ProjectArchiveFilter } from '~relay/ProjectListViewRefetchQuery.graphql'
type Props = {
  readonly authorId?: string
  readonly onlyPublic: boolean
  readonly term?: string | null | undefined
  // Used only on /themes page
  readonly themeId: string | null | undefined
  // Default props not working
  readonly orderBy?: string | null | undefined
  // Defined pagination limit
  readonly limit: number
  // Should we allow pagination ?
  readonly paginate: boolean
  readonly isProjectsPage?: boolean
  readonly features: FeatureToggles
  readonly archived?: ProjectArchiveFilter | null
}

class ProjectsList extends React.Component<Props> {
  initialRenderVars: any = {}
  static defaultProps = {
    limit: 50,
    paginate: true,
    themeId: null,
    onlyPublic: false,
  }

  constructor(props: Props) {
    super(props)
    this.initialRenderVars = {
      ...getInitialValues(props),
      orderBy: props.orderBy,
      term: props.term,
      limit: props.limit,
      author: props.authorId,
      onlyPublic: props.onlyPublic,
    }

    if (props.themeId) {
      this.initialRenderVars.theme = props.themeId
    }
  }

  renderProjectList = ({
    error,
    props,
  }: ReactRelayReadyState & {
    props: ProjectsListQuery$data | null | undefined
  }) => {
    const { limit, paginate, isProjectsPage } = this.props

    if (error) {
      console.log(error) // eslint-disable-line no-console

      return graphqlError
    }

    if (props) {
      return <ProjectListView query={props} limit={limit} paginate={paginate} isProjectsPage={isProjectsPage} />
    }

    return <ProjectsListPlaceholder count={limit} />
  }

  render() {
    const { orderBy, type, theme, term, limit, status, author, onlyPublic, archived, district } = this.initialRenderVars
    return (
      <QueryRenderer
        environment={environment as any}
        query={graphql`
          query ProjectsListQuery(
            $author: ID
            $count: Int
            $cursor: String
            $theme: ID
            $orderBy: ProjectOrder
            $type: ID
            $term: String
            $status: ID
            $onlyPublic: Boolean
            $archived: ProjectArchiveFilter
            $district: ID
          ) {
            ...ProjectListView_query
              @arguments(
                theme: $theme
                orderBy: $orderBy
                cursor: $cursor
                author: $author
                type: $type
                term: $term
                status: $status
                count: $count
                onlyPublic: $onlyPublic
                archived: $archived
                district: $district
              )
          }
        `}
        variables={{
          type,
          term,
          theme,
          status,
          author,
          onlyPublic,
          count: limit,
          orderBy: {
            field: orderBy,
            direction: 'DESC',
          },
          district,
          archived,
        }}
        render={this.renderProjectList}
      />
    )
  }
}

const mapStateToProps = (state: GlobalState) => ({
  orderBy: state.project.orderBy || 'PUBLISHED_AT',
  features: state.default.features,
})

export default connect(mapStateToProps)(ProjectsList)
