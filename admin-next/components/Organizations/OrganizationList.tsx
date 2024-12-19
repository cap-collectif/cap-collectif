import * as React from 'react'
import CardOrg from '@ui/CardOrg/CardOrg'
import { Button, Flex, Text, Box } from '@cap-collectif/ui'
import { graphql, usePaginationFragment } from 'react-relay'
import { useIntl } from 'react-intl'
import { OrganizationList_query$key } from '@relay/OrganizationList_query.graphql'
import CreateOrganizationButton from '../Organizations/CreateOrganizationButton'
import EmptyMessage from '@ui/Table/EmptyMessage'
import { ORGANIZATION_PAGINATION_COUNT } from 'pages/admin-next/organizations'

export interface OrganizationListProps {
  query: OrganizationList_query$key
  onReset: () => void
}
export const FRAGMENT = graphql`
  fragment OrganizationList_query on Query
  @argumentDefinitions(
    affiliations: { type: "[OrganizationAffiliation!]" }
    term: { type: "String" }
    count: { type: "Int" }
    cursor: { type: "String" }
  )
  @refetchable(queryName: "OrganizationListQuery") {
    organizations(after: $cursor, first: $count, search: $term, affiliations: $affiliations)
      @connection(key: "OrganizationList_organizations", filters: []) {
      totalCount
      edges {
        node {
          id
          title
          displayName
          url
          members {
            totalCount
          }
          logo {
            id
            url
            description
          }
        }
      }
    }
  }
`

const OrganizationList: React.FC<OrganizationListProps> = ({ query: queryRef, onReset }) => {
  const intl = useIntl()
  const { data: query, loadNext, hasNext, isLoadingNext } = usePaginationFragment(FRAGMENT, queryRef)
  const organizations = query.organizations?.edges
    ?.filter(Boolean)
    .map(edge => edge?.node)
    .filter(Boolean)

  const hasOrganizations = (query?.organizations?.totalCount ?? 0) > 0

  return (
    <>
      <Flex direction="row" wrap="wrap">
        <CreateOrganizationButton />
        {!hasOrganizations && <EmptyMessage onReset={onReset} />}
        {hasOrganizations &&
          organizations?.map(organization => {
            const hasLogo = !!organization?.logo
            return (
              <CardOrg key={organization?.id} marginBottom={4} marginRight={4}>
                <CardOrg.Header>
                  {hasLogo ? (
                    <img
                      style={{ objectFit: 'cover', width: '50%' }}
                      src={organization?.logo?.url}
                      alt={organization?.logo?.description || ''}
                    />
                  ) : (
                    <Text textAlign="center">{organization?.title}</Text>
                  )}
                </CardOrg.Header>
                <CardOrg.Body>
                  <Text>
                    {intl.formatMessage({ id: 'organizations.members' }, { num: organization?.members?.totalCount })}
                  </Text>
                  <Button
                    onClick={() => {
                      window.open(`/admin-next/organizationConfig/${organization?.id}`, '_self')
                    }}
                    variant="tertiary"
                    variantColor="primary"
                  >
                    {intl.formatMessage({ id: 'global.handle' })}
                  </Button>
                </CardOrg.Body>
              </CardOrg>
            )
          })}
      </Flex>
      {hasNext && (
        <Box>
          <Button variant="tertiary" onClick={() => loadNext(ORGANIZATION_PAGINATION_COUNT)} isLoading={isLoadingNext}>
            {intl.formatMessage({ id: 'global.more' })}
          </Button>
        </Box>
      )}
    </>
  )
}

export default OrganizationList
