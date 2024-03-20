import * as React from 'react'
import { NextPage } from 'next'
import { Flex, Spinner, CapUIIconSize, Card, Heading, Text, Box, Search } from '@cap-collectif/ui'
import { PageProps } from '../types'
import Layout from '../components/Layout/Layout'
import { useIntl } from 'react-intl'
import withPageAuthRequired from '../utils/withPageAuthRequired'
import OrganizationList from '../components/Organizations/OrganizationList'
import { graphql, GraphQLTaggedNode, useLazyLoadQuery } from 'react-relay'
import { organizationsQuery } from '@relay/organizationsQuery.graphql'
import debounce from '@utils/debounce-promise'

export interface OrganizationPageProps {}

const QUERY: GraphQLTaggedNode = graphql`
  query organizationsQuery($count: Int, $cursor: String, $term: String, $affiliations: [OrganizationAffiliation!]) {
    ...OrganizationList_query @arguments(affiliations: $affiliations, count: $count, cursor: $cursor, term: $term)
  }
`

export const ORGANIZATION_PAGINATION_COUNT = 50

const OrganizationPage: React.FC<OrganizationPageProps> = () => {
  const intl = useIntl()
  const [term, setTerm] = React.useState('')
  const query = useLazyLoadQuery<organizationsQuery>(
    QUERY,
    {
      count: ORGANIZATION_PAGINATION_COUNT,
      cursor: null,
      term,
      affiliations: null,
    },
    { fetchPolicy: 'store-and-network' },
  )

  const search = debounce((value: string) => {
    setTerm(value)
  }, 500)

  const onReset = () => {
    setTerm('')
  }

  return (
    <Flex direction="column" spacing={6}>
      <Flex as={Card} direction="column" spacing={8} backgroundColor="white" borderRadius="8px">
        <Flex direction="column">
          <Flex justifyContent="space-between" alignItems="center">
            <Box>
              <Heading as="h4" fontWeight="bold" color="blue.800">
                {intl.formatMessage({ id: 'global.general' })}
              </Heading>
              <Text color="gray.700">{intl.formatMessage({ id: 'admin.organizations.subtitle' })}</Text>
            </Box>
            <Search
              id="search-organization"
              onChange={search}
              value={term}
              placeholder={intl.formatMessage({ id: 'vote.step.search' })}
            />
          </Flex>
        </Flex>
        <OrganizationList query={query} onReset={onReset} />
      </Flex>
    </Flex>
  )
}

const Organizations: NextPage<PageProps> = () => {
  const intl = useIntl()
  return (
    <Layout navTitle={intl.formatMessage({ id: 'global.all.organisation' })}>
      <React.Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <OrganizationPage />
      </React.Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default Organizations
