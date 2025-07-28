import React, { useState } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import type { RelayPaginationProp } from 'react-relay'
import { graphql, createPaginationContainer } from 'react-relay'
import type { ProjectListViewPaginated_query$data } from '~relay/ProjectListViewPaginated_query.graphql'
import ProjectPreview from '../Preview/ProjectPreview'
import type { State, FeatureToggles } from '~/types'
import { Box, Grid } from '@cap-collectif/ui'

type Props = {
  relay: RelayPaginationProp
  query: ProjectListViewPaginated_query$data
  limit: number
  paginate: boolean
  features: FeatureToggles
  isProjectsPage?: boolean
}

const renderPreview = (query: ProjectListViewPaginated_query$data, isProjectsPage?: boolean) => {
  return query.projects.edges
    ?.filter(Boolean)
    .map(edge => edge.node)
    .filter(Boolean)
    .map((node, index) => <ProjectPreview key={index} project={node} isProjectsPage={isProjectsPage} />)
}

export const ProjectListViewPaginated = ({ relay, query, limit, paginate, isProjectsPage }: Props) => {
  const [loading, setLoading] = useState<boolean>(false)

  if (query.projects && query.projects.edges) {
    if (query.projects.edges.length > 0) {
      return (
        <div>
          <Grid templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']}>
            {renderPreview(query, isProjectsPage)}
          </Grid>

          {paginate && relay.hasMore() && (
            <Box width="100%">
              <Button
                className="see-more-projects-button ml-15"
                disabled={loading}
                css={{
                  margin: 'auto',
                  display: 'block',
                }}
                onClick={() => {
                  setLoading(true)
                  relay.loadMore(limit, () => {
                    setLoading(false)
                  })
                }}
              >
                <FormattedMessage id="see-more-projects" />
              </Button>
            </Box>
          )}
        </div>
      )
    }
  }

  return (
    <React.Fragment>
      <FormattedMessage id="project.none" />
    </React.Fragment>
  )
}

const mapStateToProps = (state: State) => ({
  features: state.default.features,
})

const connector = connect(mapStateToProps)
export default createPaginationContainer(
  connector(ProjectListViewPaginated),
  {
    query: graphql`
      fragment ProjectListViewPaginated_query on Query
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
        projects(
          author: $author
          first: $count
          after: $cursor
          theme: $theme
          orderBy: $orderBy
          type: $type
          district: $district
          status: $status
          term: $term
          onlyPublic: $onlyPublic
          archived: $archived
        ) @connection(key: "ProjectListViewPaginated_projects", filters: []) {
          edges {
            node {
              ...ProjectPreview_project
            }
          }
          pageInfo {
            hasPreviousPage
            hasNextPage
            startCursor
            endCursor
          }
        }
      }
    `,
  },
  {
    direction: 'forward',

    getConnectionFromProps(props: Props) {
      return props.query && props.query.projects
    },

    getFragmentVariables(prevVars) {
      return { ...prevVars }
    },

    getVariables(props: Props, { count, cursor }, fragmentVariables) {
      return { ...fragmentVariables, count, cursor }
    },

    query: graphql`
      query ProjectListViewPaginatedQuery(
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
        ...ProjectListViewPaginated_query
          @arguments(
            count: $count
            cursor: $cursor
            theme: $theme
            orderBy: $orderBy
            type: $type
            district: $district
            status: $status
            term: $term
            onlyPublic: $onlyPublic
            archived: $archived
          )
      }
    `,
  },
)
