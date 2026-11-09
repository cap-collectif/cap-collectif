import { Button, CapUIIcon, CapUIIconSize, Flex, Search, Spinner } from '@cap-collectif/ui'
import Layout from '@components/BackOffice/Layout/Layout'
import CreateOpinionModal from '@components/BackOffice/Opinions/CreateOpinionModal'
import OpinionList from '@components/BackOffice/Opinions/OpinionList'
import { CONNECTION_NODES_PER_PAGE, EXPORT_URL } from '@components/BackOffice/Opinions/utils'
import { useUrlToast } from '@hooks/useUrlToast'
import { opinions_Query } from '@relay/opinions_Query.graphql'
import debounce from '@shared/utils/debounce-promise'
import TablePlaceholder from '@ui/Table/TablePlaceholder'
import downloadCSV from '@utils/download-csv'
import { withFeatureFlagRequired } from '@utils/withPageAuthRequired'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, GraphQLTaggedNode, useLazyLoadQuery } from 'react-relay'

const QUERY: GraphQLTaggedNode = graphql`
  query opinions_Query($search: String, $first: Int) {
    ...OpinionList_query @arguments(search: $search, first: $first)
  }
`

const OpinionsTab: React.FC = () => {
  const intl = useIntl()
  const [term, setTerm] = React.useState<string>('')
  const [isExporting, setIsExporting] = React.useState(false)
  const search = term || null

  const onTermChange = debounce((value: string) => setTerm(value), 400)

  const queryReference = useLazyLoadQuery<opinions_Query>(QUERY, {
    search,
    first: CONNECTION_NODES_PER_PAGE,
  })

  // Like the Sonata export, the file follows the filter of the list
  const onExport = async () => {
    setIsExporting(true)
    await downloadCSV(search ? `${EXPORT_URL}?search=${encodeURIComponent(search)}` : EXPORT_URL, intl)
    setIsExporting(false)
  }

  return (
    <Flex direction="column" width="100%" spacing="lg" bg="white" borderRadius="accordion" p="xl" justify="flex-start">
      <Flex alignItems="center" spacing="lg">
        <CreateOpinionModal />
        <Button
          variant="secondary"
          variantColor="primary"
          variantSize="small"
          leftIcon={CapUIIcon.Download}
          isLoading={isExporting}
          onClick={onExport}
        >
          {intl.formatMessage({ id: 'admin.opinions.export' })}
        </Button>
        <Search
          onChange={onTermChange}
          value={term}
          placeholder={intl.formatMessage({ id: 'admin.proposals.search' })}
          aria-label={intl.formatMessage({ id: 'admin.proposals.search' })}
        />
      </Flex>

      <React.Suspense fallback={<TablePlaceholder rowsCount={20} columnsCount={12} />}>
        <OpinionList queryReference={queryReference} resetFilters={() => setTerm('')} />
      </React.Suspense>
    </Flex>
  )
}

const OpinionsPage: React.FC = () => {
  const intl = useIntl()
  useUrlToast()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'admin.label.opinion' })}>
      <React.Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <OpinionsTab />
      </React.Suspense>
    </Layout>
  )
}

export const getServerSideProps = withFeatureFlagRequired(
  'unstable__sonata_migration_to_admin_next',
  '/admin/capco/app/opinion/list',
)

export default OpinionsPage
