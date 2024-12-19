import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay'
import { Box, Heading, Grid, Button, Flex } from '@cap-collectif/ui'
import ProjectCard from '@shared/projectCard/ProjectCard'
import { DistrictPageProjectListQuery } from '@relay/DistrictPageProjectListQuery.graphql'
import { DistrictPageProjectList_query$key } from '@relay/DistrictPageProjectList_query.graphql'

export type Props = {
  id: string
}

const FRAGMENT = graphql`
  fragment DistrictPageProjectList_query on Query
  @argumentDefinitions(count: { type: "Int!" }, cursor: { type: "String" }, districtId: { type: "ID!" })
  @refetchable(queryName: "DistrictProjectListPaginationQuery") {
    projects(first: $count, after: $cursor, district: $districtId)
      @connection(key: "DistrictPage_projects", filters: ["query", "orderBy", "affiliations"]) {
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

const QUERY = graphql`
  query DistrictPageProjectListQuery($count: Int!, $cursor: String, $districtId: ID!) {
    ...DistrictPageProjectList_query @arguments(count: $count, cursor: $cursor, districtId: $districtId)
  }
`

export const DistrictPageProjectList = ({ id }: Props) => {
  const intl = useIntl()
  const query = useLazyLoadQuery<DistrictPageProjectListQuery>(QUERY, {
    count: 20,
    cursor: null,
    districtId: id,
  })

  const { data, loadNext, hasNext } = usePaginationFragment<
    DistrictPageProjectListQuery,
    DistrictPageProjectList_query$key
  >(FRAGMENT, query)
  const projects = data.projects.edges
    ?.filter(Boolean)
    .map(edge => edge.node)
    .filter(Boolean)
  return (
    <Box bg="white" pb={7}>
      <Heading mb={0} as="h4" sx={{ textTransform: 'capitalize' }}>
        {intl.formatMessage(
          {
            id: 'n_projects',
          },
          {
            num: data.projects.totalCount,
          },
        )}
      </Heading>
      <Grid templateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)']} marginLeft={-4}>
        {projects.map((node, index) => (
          <Flex mt={7} mb={7} mr={5} ml={5} key={index}>
            <ProjectCard project={node} />
          </Flex>
        ))}
      </Grid>
      {hasNext ? (
        <Button
          onClick={() => loadNext(20)}
          variant="secondary"
          variantColor="primary"
          variantSize="small"
          m="auto"
          mt={7}
          width={['100%', 'unset']}
          justifyContent="center"
        >
          {intl.formatMessage({
            id: 'global.more',
          })}
        </Button>
      ) : null}
    </Box>
  )
}
export default DistrictPageProjectList
