import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, usePaginationFragment } from 'react-relay'
import type { DistrictPageProjectList_query$key } from '~relay/DistrictPageProjectList_query.graphql'
import Button from '../DesignSystem/Button/Button'
import ProjectPreview from '../Project/Preview/ProjectPreview'
import { Box, Heading, Grid } from '@cap-collectif/ui'

export type Props = {
  query: DistrictPageProjectList_query$key
}

const DistrictPageProjectListQuery = graphql`
  fragment DistrictPageProjectList_query on Query
  @argumentDefinitions(count: { type: "Int!" }, cursor: { type: "String" }, districtId: { type: "ID!" })
  @refetchable(queryName: "DistrictProjectListPaginationQuery") {
    projects(first: $count, after: $cursor, district: $districtId)
      @connection(key: "DistrictPage_projects", filters: ["query", "orderBy", "affiliations"]) {
      totalCount
      edges {
        node {
          id
          ...ProjectPreview_project
        }
      }
    }
  }
`

export const DistrictPageProjectList = ({ query }: Props) => {
  const intl = useIntl()
  const { data, loadNext, hasNext } = usePaginationFragment(DistrictPageProjectListQuery, query)
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
          // @ts-ignore old relay syntax
          <ProjectPreview key={index} project={node} forceNewCardDesign />
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
