'use client'

import { Box, BoxProps, Button, CapUIFontSize, Flex, Grid, Spinner, Text } from '@cap-collectif/ui'
import { ProjectListSection_query$key } from '@relay/ProjectListSection_query.graphql'
import { ProjectListSectionList_query$key } from '@relay/ProjectListSectionList_query.graphql'
import ProjectCard from '@shared/projectCard/ProjectCard'
import { FC, Suspense } from 'react'
import { useIntl } from 'react-intl'
import { graphql, useFragment, usePaginationFragment } from 'react-relay'
import { ProjectListSectionFilters, ProjectListSectionFiltersProps } from './ProjectListSectionFilters'
import ProjectsListPlaceholder, { ProjectsListFiltersPlaceholder } from '@shared/projectCard/ProjectsListSkeleton'
import { pxToRem } from '@shared/utils/pxToRem'
import { ProjectOrderField } from '@relay/ProjectListSectionQuery.graphql'

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
}> = ({ query: queryKey }) => {
  const intl = useIntl()
  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment(ProjectListSectionListQuery, queryKey)

  return (
    <Box className="project-list-section-projects">
      {data.projects?.totalCount ? (
        <>
          <Grid templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']} gap="lg" mt={8}>
            {data.projects.edges.map(({ node }) => (
              <ProjectCard key={node.id} project={node} mx={['auto', 'unset']} primaryInfoTag="h2" />
            ))}
          </Grid>
          {isLoadingNext ? <Spinner m="auto" mt={5} /> : null}
          {hasNext ? (
            <Flex justifyContent="center">
              <Button
                variant="primary"
                variantSize="medium"
                onClick={() => loadNext(20)}
                mt="xl"
                disabled={isLoadingNext}
              >
                {intl.formatMessage({ id: 'see-more-projects' })}
              </Button>
            </Flex>
          ) : null}
        </>
      ) : (
        <Text textAlign="center" my="8rem" fontSize={CapUIFontSize.Headline}>
          {intl.formatMessage({ id: 'project.none' })}
        </Text>
      )}
    </Box>
  )
}

const FRAGMENT = graphql`
  fragment ProjectListSection_query on Query
  @argumentDefinitions(
    count: { type: "Int", defaultValue: 20 }
    term: { type: "String", defaultValue: null }
    orderBy: { type: "ProjectOrder", defaultValue: { direction: DESC, field: PUBLISHED_AT } }
    author: { type: "ID" }
    theme: { type: "ID" }
    type: { type: "ID" }
    district: { type: "ID" }
    status: { type: "ID" }
    onlyPublic: { type: "Boolean" }
    archived: { type: "ProjectArchiveFilter" }
  ) {
    ...ProjectListSectionList_query
      @arguments(
        count: $count
        author: $author
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
`

export const ProjectListSection: FC<
  BoxProps &
    ProjectListSectionFiltersProps & { query: ProjectListSection_query$key } & { orderByFilter: ProjectOrderField }
> = ({
  query: queryKey,
  term,
  setTerm,
  orderBy,
  setOrderBy,
  author,
  setAuthor,
  type,
  setType,
  state,
  setState,
  theme,
  setTheme,
  district,
  setDistrict,
  status,
  setStatus,
  orderByFilter,
  ...rest
}) => {
  const query = useFragment(FRAGMENT, queryKey)

  return (
    <Box as="section" className="project-list-section" {...rest}>
      <Box mx="auto" maxWidth={pxToRem(1280)} px={[0, 6]} mt={['xl', 'xxl']} pb={['xl', 'xxl']}>
        <Suspense fallback={<ProjectsListFiltersPlaceholder />}>
          <ProjectListSectionFilters
            term={term}
            setTerm={setTerm}
            orderBy={orderBy || 'PUBLISHED_AT'}
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
        </Suspense>
        <Suspense fallback={<ProjectsListPlaceholder count={10} />}>
          <ProjectListSectionList query={query} />
        </Suspense>
      </Box>
    </Box>
  )
}

export default ProjectListSection
