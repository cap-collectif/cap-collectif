import * as React from 'react'
import { graphql, usePaginationFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import type { OrganizationPageProjectList_organization$key } from '@relay/OrganizationPageProjectList_organization.graphql'
import { Flex, Button, Heading } from '@cap-collectif/ui'
import useIsMobile from '@shared/hooks/useIsMobile'
import ProjectCard from '@shared/projectCard/ProjectCard'
import { pxToRem } from '@shared/utils/pxToRem'

const FRAGMENT = graphql`
  fragment OrganizationPageProjectList_organization on Organization
  @argumentDefinitions(count: { type: "Int!" }, cursor: { type: "String" })
  @refetchable(queryName: "OrganizationPageProjectListPaginationQuery") {
    projects(first: $count, after: $cursor)
      @connection(key: "OrganizationPageProjectList_projects", filters: ["query", "orderBy"]) {
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

const getItemStyles = (position: number, fullSizeLayout: boolean, isMobile: boolean) => {
  if (isMobile)
    return {
      width: '100%',
      variantSize: undefined,
    }

  if (fullSizeLayout) {
    if (!position)
      return {
        width: '100%',
        variantSize: 'L',
      }
    if (position < 3)
      return {
        width: '50%',
        variantSize: 'M',
      }
    return {
      width: '33.33%',
      variantSize: undefined,
    }
  }

  if (!position)
    return {
      width: '100%',
      variantSize: 'M',
    }
  return {
    width: '50%',
    variantSize: undefined,
  }
}

export type Props = {
  readonly organization: OrganizationPageProjectList_organization$key
  readonly fullSizeLayout: boolean
}
export const OrganizationPageProjectList = ({ organization, fullSizeLayout }: Props) => {
  const intl = useIntl()
  const { data, loadNext, hasNext } = usePaginationFragment(FRAGMENT, organization)
  const isMobile = useIsMobile()
  if (!data) return null
  const { projects } = data
  return (
    <Flex direction="column" width={['100%', fullSizeLayout ? '100%' : `calc(70% - ${pxToRem(16)})`]}>
      <Heading as="h4" mb={4}>
        {intl.formatMessage({
          id: 'project.title',
        })}
      </Heading>
      <Flex flexWrap="wrap" mt={-4} ml={[0, -4]}>
        {projects?.edges?.map((edge, index) => (
          <ProjectCard
            project={edge?.node}
            key={index}
            {...(getItemStyles(index, fullSizeLayout, isMobile) as {
              width: string
              variantSize?: 'L' | 'M'
            })}
            height="auto"
            px={[0, 4]}
            py={4}
          />
        ))}
      </Flex>
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
