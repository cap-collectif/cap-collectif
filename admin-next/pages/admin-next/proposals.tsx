import { Button, CapUIIcon, CapUIIconSize, Flex, Search, Spinner } from '@cap-collectif/ui'
import Layout from '@components/BackOffice/Layout/Layout'
import ProposalFusionModal from '@components/BackOffice/Proposals/ProposalFusionModal'
import ProposalList from '@components/BackOffice/Proposals/ProposalList'
import { CONNECTION_NODES_PER_PAGE } from '@components/BackOffice/Proposals/utils'
import type { proposals_Query } from '@relay/proposals_Query.graphql'
import debounce from '@shared/utils/debounce-promise'
import TablePlaceholder from '@ui/Table/TablePlaceholder'
import { withFeatureFlagRequired } from '@utils/withPageAuthRequired'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'

const QUERY = graphql`
  query proposals_Query($search: String, $first: Int) {
    ...ProposalList_query @arguments(search: $search, first: $first)
  }
`

const ProposalsTab: React.FC = () => {
  const intl = useIntl()
  const [term, setTerm] = React.useState<string>('')

  const onTermChange = debounce((value: string) => setTerm(value), 400)

  // The search is refetched by ProposalList, so that only the list suspends while the search field keeps its focus
  const queryReference = useLazyLoadQuery<proposals_Query>(QUERY, {
    search: null,
    first: CONNECTION_NODES_PER_PAGE,
  })

  return (
    <Flex direction="column" width="100%" spacing={6} bg="white" borderRadius="accordion" p="lg" justify="flex-start">
      <Flex alignItems="center" spacing={6}>
        <ProposalFusionModal
          disclosure={
            <Button variant="primary" variantColor="primary" variantSize="small" leftIcon={CapUIIcon.Add}>
              {intl.formatMessage({ id: 'admin.proposals.merge' })}
            </Button>
          }
        />
        <Search
          onChange={onTermChange}
          value={term}
          placeholder={intl.formatMessage({ id: 'admin.proposals.search' })}
          aria-label={intl.formatMessage({ id: 'admin.proposals.search' })}
        />
      </Flex>

      <React.Suspense fallback={<TablePlaceholder rowsCount={20} columnsCount={10} />}>
        <ProposalList queryReference={queryReference} term={term} resetFilters={() => setTerm('')} />
      </React.Suspense>
    </Flex>
  )
}

const ProposalsPage: React.FC = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'admin.label.proposal' })}>
      <React.Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <ProposalsTab />
      </React.Suspense>
    </Layout>
  )
}

export const getServerSideProps = withFeatureFlagRequired(
  'unstable__sonata_migration_to_admin_next',
  '/admin/capco/app/proposal/list',
)

export default ProposalsPage
