'use client'

import { Box, BoxProps, Button, Flex, Grid, Spinner, Text } from '@cap-collectif/ui'
import useUrlState from '@hooks/useUrlState'
import { ProjectListSection_query$key } from '@relay/ProjectListSection_query.graphql'
import { ProjectListSectionList_query$key } from '@relay/ProjectListSectionList_query.graphql'
import ProjectCard from '@shared/projectCard/ProjectCard'
import { FC, Suspense, useEffect } from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment, usePaginationFragment } from 'react-relay'
import { ProjectListSectionFilters } from './ProjectListSectionFilters'
import ProjectsListPlaceholder from '@shared/projectCard/ProjectsListSkeleton'
import { pxToRem } from '@shared/utils/pxToRem'

export const ProjectListSectionListQuery = graphql`
  # on Query for now - maybe on Section later 😇
  fragment ProjectListSectionList_query on Query
  @argumentDefinitions(
    count: { type: "Int", defaultValue: 20 }
    cursor: { type: "String", defaultValue: null }
    term: { type: "String", defaultValue: null }
    orderBy: { type: "ProjectOrder", defaultValue: { direction: DESC, field: PUBLISHED_AT } }
    author: { type: "ID" }
    theme: { type: "ID" }
    type: { type: "ID" }
    district: { type: "ID" }
    status: { type: "ID" }
    onlyPublic: { type: "Boolean" }
    archived: { type: "ProjectArchiveFilter" }
  )
  @refetchable(queryName: "ProjectListSectionQuery") {
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
    )
      @connection(
        key: "ProjectListSection_projects"
        filters: ["term", "orderBy", "author", "type", "archived", "theme", "district", "status"]
      ) {
      totalCount
      edges {
        node {
          id
          ...ProjectCardshared_project
        }
      }
    }
  }
`

export const ProjectListSectionList: FC<{
  query: ProjectListSectionList_query$key
  term?: string
  orderBy: string
  author?: string
  type?: string
  state?: string
  theme?: string
  district?: string
  status?: string
}> = ({ query: queryKey, term, orderBy, author, type, state, theme, district, status }) => {
  const intl = useIntl()
  const { data, loadNext, hasNext, refetch, isLoadingNext } = usePaginationFragment(
    ProjectListSectionListQuery,
    queryKey,
  )

  useEffect(() => {
    refetch({
      term,
      orderBy: { direction: 'DESC', field: orderBy },
      author,
      type,
      archived: state,
      theme,
      district,
      status,
    })
  }, [refetch, term, orderBy, author, type, state, theme, district, status])

  return (
    <Box className="project-list-section-projects" mb={[4, 6]}>
      {data.projects?.totalCount ? (
        <>
          <Grid templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']} gap={8} mt={8}>
            {data.projects.edges.map(({ node }) => {
              return (
                <Flex key={node.id}>
                  <ProjectCard project={node} isProjectsPage />
                </Flex>
              )
            })}
          </Grid>
          {isLoadingNext ? <Spinner m="auto" mt={5} /> : null}
          {hasNext ? (
            <Flex justifyContent="center">
              <Button variant="secondary" onClick={() => loadNext(20)} my={5} disabled={isLoadingNext}>
                {intl.formatMessage({ id: 'see-more-projects' })}
              </Button>
            </Flex>
          ) : null}
        </>
      ) : (
        <Text textAlign="center" my="8rem" fontSize={4}>
          {intl.formatMessage({ id: 'project.none' })}
        </Text>
      )}
    </Box>
  )
}

const FRAGMENT = graphql`
  fragment ProjectListSection_query on Query {
    ...ProjectListSectionList_query
    ...ProjectListSectionFilters_query
  }
`

export const ProjectListSection: FC<BoxProps & { query: ProjectListSection_query$key }> = ({
  query: queryKey,
  ...rest
}) => {
  const query = useFragment(FRAGMENT, queryKey)
  const [term, setTerm] = useUrlState('term', '')
  const [author, setAuthor] = useUrlState('author', '')
  const [type, setType] = useUrlState('type', '')
  const [orderBy, setOrderBy] = useUrlState('orderBy', '')
  const [state, setState] = useUrlState('state', 'ACTIVE')
  const [theme, setTheme] = useUrlState('theme', '')
  const [district, setDistrict] = useUrlState('district', '')
  const [status, setStatus] = useUrlState('status', '')
  const orderByFilter = ['PUBLISHED_AT', 'POPULAR'].includes(orderBy) ? orderBy : 'PUBLISHED_AT'
  const stateFilter = !['ARCHIVED', 'ACTIVE'].includes(state) ? null : state

  return (
    <Box as="section" className="project-list-section" {...rest}>
      <Box mx="auto" maxWidth={pxToRem(1280)} px={[4, 6]}>
        <ProjectListSectionFilters
          query={query}
          term={term}
          setTerm={setTerm}
          orderBy={orderBy}
          setOrderBy={setOrderBy}
          author={author}
          setAuthor={setAuthor}
          type={type}
          setType={setType}
          state={state}
          setState={setState}
          theme={theme}
          setTheme={setTheme}
          district={district}
          setDistrict={setDistrict}
          status={status}
          setStatus={setStatus}
        />
        <Suspense fallback={<ProjectsListPlaceholder count={20} />}>
          <ProjectListSectionList
            query={query}
            term={term}
            orderBy={orderByFilter}
            author={author}
            type={type}
            state={stateFilter}
            theme={theme}
            district={district}
            status={status}
          />
        </Suspense>
      </Box>
    </Box>
  )
}

export default ProjectListSection
