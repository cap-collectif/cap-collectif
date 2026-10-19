import { Button, CapUIIcon, CapUIIconSize, Flex, Search, Spinner } from '@cap-collectif/ui'
import Layout from '@components/BackOffice/Layout/Layout'
import ThemeList from '@components/BackOffice/Themes/ThemeList'
import { CONNECTION_NODES_PER_PAGE } from '@components/BackOffice/Themes/utils'
import { themes_Query } from '@relay/themes_Query.graphql'
import debounce from '@shared/utils/debounce-promise'
import TablePlaceholder from '@ui/Table/TablePlaceholder'
import { withFeatureFlagRequired } from '@utils/withPageAuthRequired'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, GraphQLTaggedNode, useLazyLoadQuery } from 'react-relay'

const QUERY: GraphQLTaggedNode = graphql`
  query themes_Query($search: String, $first: Int) {
    ...ThemeList_query @arguments(search: $search, first: $first)
  }
`

const ThemesTab: React.FC = () => {
  const intl = useIntl()
  const [term, setTerm] = React.useState<string>('')

  const onTermChange = debounce((value: string) => setTerm(value), 400)

  // The search is refetched by ThemeList, so that only the list suspends while the search field keeps its focus
  const queryReference = useLazyLoadQuery<themes_Query>(QUERY, {
    search: null,
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
          onClick={() => window.open('/admin-next/theme', '_self')}
        >
          {intl.formatMessage({ id: 'admin.themes.create' })}
        </Button>
        <Search
          onChange={onTermChange}
          value={term}
          placeholder={intl.formatMessage({ id: 'admin.themes.search' })}
          aria-label={intl.formatMessage({ id: 'admin.themes.search' })}
        />
      </Flex>

      <React.Suspense fallback={<TablePlaceholder rowsCount={20} columnsCount={9} />}>
        <ThemeList queryReference={queryReference} term={term} resetFilters={() => setTerm('')} />
      </React.Suspense>
    </Flex>
  )
}

export const getServerSideProps = withFeatureFlagRequired(
  'unstable__sonata_migration_to_admin_next',
  '/admin/capco/app/theme/list',
)

const ThemesPage: React.FC = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'admin.label.theme' })}>
      <React.Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <ThemesTab />
      </React.Suspense>
    </Layout>
  )
}

export default ThemesPage
