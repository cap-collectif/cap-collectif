import { Button, CapUIIcon, CapUIIconSize, Flex, Search, Spinner } from '@cap-collectif/ui'
import Layout from '@components/BackOffice/Layout/Layout'
import MenuItemList from '@components/BackOffice/MenuItems/MenuItemList'
import { CONNECTION_NODES_PER_PAGE } from '@components/BackOffice/MenuItems/utils'
import { menuItems_Query } from '@relay/menuItems_Query.graphql'
import debounce from '@shared/utils/debounce-promise'
import TablePlaceholder from '@ui/Table/TablePlaceholder'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, GraphQLTaggedNode, useLazyLoadQuery } from 'react-relay'

const QUERY: GraphQLTaggedNode = graphql`
  query menuItems_Query($search: String, $first: Int) {
    ...MenuItemList_query @arguments(search: $search, first: $first)
  }
`

const MenuItemsTab: React.FC = () => {
  const intl = useIntl()
  const [term, setTerm] = React.useState<string>('')

  const onTermChange = debounce((value: string) => setTerm(value), 400)

  const queryReference = useLazyLoadQuery<menuItems_Query>(QUERY, {
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
          onClick={() => window.open('/admin-next/menu-item', '_self')}
        >
          {intl.formatMessage({ id: 'admin.menu-items.create' })}
        </Button>
        <Search
          onChange={onTermChange}
          value={term}
          placeholder={intl.formatMessage({ id: 'admin.menu-items.search' })}
          aria-label={intl.formatMessage({ id: 'admin.menu-items.search' })}
        />
      </Flex>

      <React.Suspense fallback={<TablePlaceholder rowsCount={20} columnsCount={9} />}>
        <MenuItemList queryReference={queryReference} resetFilters={() => setTerm('')} />
      </React.Suspense>
    </Flex>
  )
}

export const getServerSideProps = withPageAuthRequired

const MenuItemsPage: React.FC = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'admin.label.menu_item' })}>
      <React.Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <MenuItemsTab />
      </React.Suspense>
    </Layout>
  )
}

export default MenuItemsPage
