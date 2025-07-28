import * as React from 'react'
import { graphql, usePaginationFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import type { OrganizationPageProjectList_organization$key } from '@relay/OrganizationPageProjectList_organization.graphql'
import { Flex, Button, Heading, Grid, CapUIFontSize } from '@cap-collectif/ui'
import ProjectCard from '@shared/projectCard/ProjectCard'
import { pxToRem } from '@shared/utils/pxToRem'

const FRAGMENT = graphql`
  fragment OrganizationPageProjectList_organization on Organization
  @argumentDefinitions(count: { type: "Int!" }, cursor: { type: "String" })
  @refetchable(queryName: "OrganizationPageProjectListPaginationQuery") {
    projects(first: $count, after: $cursor) @connection(key: "OrganizationPageProjectList_projects") {
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

export type Props = {
  organization: OrganizationPageProjectList_organization$key
  fullSizeLayout: boolean
}
export const OrganizationPageProjectList = ({ organization, fullSizeLayout }: Props) => {
  const intl = useIntl()
  const { data, loadNext, hasNext } = usePaginationFragment(FRAGMENT, organization)

  if (!data) return null
  const { projects } = data

  return (
    <Flex direction="column" width={['100%', fullSizeLayout ? '100%' : `calc(70% - ${pxToRem(16)})`]}>
      <Heading as="h2" color="neutral-gray.darker" fontSize={CapUIFontSize.BodyLarge}>
        {intl.formatMessage({
          id: 'project.title',
        })}
      </Heading>
      <Grid
        templateColumns={[
          '1fr',
          fullSizeLayout ? 'repeat(2, 1fr)' : '1fr',
          fullSizeLayout ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
        ]}
        gap="lg"
        mt="md"
      >
        {projects?.edges?.map((edge, index) => (
          <ProjectCard project={edge?.node} key={index} mx="auto" />
        ))}
      </Grid>
      {hasNext ? (
        <Flex mt={2} width="100%">
          <Button variant="tertiary" margin="auto" onClick={() => loadNext(20)}>
            {intl.formatMessage({
              id: 'global.more',
            })}
          </Button>
        </Flex>
      ) : null}
    </Flex>
  )
}
export default OrganizationPageProjectList
