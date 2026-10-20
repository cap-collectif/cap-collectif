import { Table } from '@cap-collectif/ui'
import { useLayoutContext } from '@components/BackOffice/Layout/Layout.context'
import { MenuItemList_query$key } from '@relay/MenuItemList_query.graphql'
import EmptyMessage from '@ui/Table/EmptyMessage'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, usePaginationFragment } from 'react-relay'
import MenuItemRow from './MenuItemRow'
import { CONNECTION_NODES_PER_PAGE } from './utils'

const FRAGMENT = graphql`
  fragment MenuItemList_query on Query
  @argumentDefinitions(search: { type: "String" }, first: { type: "Int" }, cursor: { type: "String" })
  @refetchable(queryName: "MenuItemListPaginationQuery") {
    adminMenuItems(search: $search, first: $first, after: $cursor)
      @connection(key: "MenuItemList_adminMenuItems", filters: ["search"]) {
      __id
      totalCount
      edges {
        node {
          id
          ...MenuItemRow_menuItem
        }
      }
    }
  }
`

type Props = {
  queryReference: MenuItemList_query$key
  resetFilters: () => void
}

const MenuItemList: React.FC<Props> = ({ queryReference, resetFilters }) => {
  const intl = useIntl()
  const { contentRef } = useLayoutContext()
  const { data, loadNext, hasNext } = usePaginationFragment(FRAGMENT, queryReference)
  const menuItems = (data?.adminMenuItems?.edges ?? [])
    .map(edge => edge?.node)
    .filter((menuItem): menuItem is NonNullable<typeof menuItem> => Boolean(menuItem))

  return (
    <Table emptyMessage={<EmptyMessage onReset={resetFilters} />} style={{ border: 'none' }} onReset={resetFilters}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'global.title' })}</Table.Th>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'admin.fields.menu_item.menu' })}</Table.Th>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'global.published' })}</Table.Th>
          <Table.Th lineHeight="sm" isNumeric textAlign="left">
            {intl.formatMessage({ id: 'global.position' })}
          </Table.Th>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'admin.fields.menu_item.parent' })}</Table.Th>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'admin.menu-items.custom-page' })}</Table.Th>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'global.link' })}</Table.Th>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'global.maj' })}</Table.Th>
          <Table.Th lineHeight="sm" display="flex" justifyContent="center">
            {' '}
          </Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody
        useInfiniteScroll={menuItems.length > 0}
        onScrollToBottom={() => loadNext(CONNECTION_NODES_PER_PAGE)}
        hasMore={hasNext}
        scrollParentRef={contentRef || undefined}
      >
        {menuItems.map(menuItem => (
          <Table.Tr key={menuItem.id} rowId={menuItem.id}>
            <MenuItemRow menuItem={menuItem} connectionId={data.adminMenuItems.__id} />
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}

export default MenuItemList
