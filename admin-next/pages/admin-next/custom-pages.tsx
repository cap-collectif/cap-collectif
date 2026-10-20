import { Button, CapUIIcon, CapUIIconSize, Flex, Search, Spinner } from '@cap-collectif/ui'
import CustomPageList from '@components/BackOffice/CustomPages/CustomPageList'
import { CONNECTION_NODES_PER_PAGE } from '@components/BackOffice/CustomPages/utils'
import Layout from '@components/BackOffice/Layout/Layout'
import { customPages_Query } from '@relay/customPages_Query.graphql'
import debounce from '@shared/utils/debounce-promise'
import TablePlaceholder from '@ui/Table/TablePlaceholder'
import { withFeatureFlagRequired } from '@utils/withPageAuthRequired'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, GraphQLTaggedNode, useLazyLoadQuery } from 'react-relay'

const QUERY: GraphQLTaggedNode = graphql`
  query customPages_Query($search: String, $first: Int) {
    ...CustomPageList_query @arguments(search: $search, first: $first)
  }
`

const CustomPagesTab: React.FC = () => {
  const intl = useIntl()
  const [term, setTerm] = React.useState<string>('')

  const onTermChange = debounce((value: string) => setTerm(value), 400)

  const queryReference = useLazyLoadQuery<customPages_Query>(QUERY, {
    search: term || null,
    first: CONNECTION_NODES_PER_PAGE,
  })

  return (
    <Flex direction="column" width="100%" spacing={6} bg="white" borderRadius="accordion" p={8} justify="flex-start">
      <Flex alignItems="center" spacing={6}>
        <Button
          variant="primary"
          variantColor="primary"
          variantSize="small"
          leftIcon={CapUIIcon.Add}
          onClick={() => window.open('/admin-next/custom-page', '_self')}
        >
          {intl.formatMessage({ id: 'admin.custom-pages.create' })}
        </Button>
        <Search
          onChange={onTermChange}
          value={term}
          placeholder={intl.formatMessage({ id: 'admin.custom-pages.search' })}
          aria-label={intl.formatMessage({ id: 'admin.custom-pages.search' })}
        />
      </Flex>

      <React.Suspense fallback={<TablePlaceholder rowsCount={20} columnsCount={6} />}>
        <CustomPageList queryReference={queryReference} resetFilters={() => setTerm('')} />
      </React.Suspense>
    </Flex>
  )
}

export const getServerSideProps = withFeatureFlagRequired(
  'unstable__sonata_migration_to_admin_next',
  '/admin/capco/app/page/list',
)

const CustomPagesPage: React.FC = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'admin.label.page' })}>
      <React.Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <CustomPagesTab />
      </React.Suspense>
    </Layout>
  )
}

export default CustomPagesPage
