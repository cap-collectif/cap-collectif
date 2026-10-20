import { Table } from '@cap-collectif/ui'
import { useLayoutContext } from '@components/BackOffice/Layout/Layout.context'
import { CustomPageList_query$key } from '@relay/CustomPageList_query.graphql'
import EmptyMessage from '@ui/Table/EmptyMessage'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, usePaginationFragment } from 'react-relay'
import CustomPageItem from './CustomPageItem'
import { CONNECTION_NODES_PER_PAGE } from './utils'

const FRAGMENT = graphql`
  fragment CustomPageList_query on Query
  @argumentDefinitions(search: { type: "String" }, first: { type: "Int" }, cursor: { type: "String" })
  @refetchable(queryName: "CustomPageListPaginationQuery") {
    customPages(search: $search, first: $first, after: $cursor)
      @connection(key: "CustomPageList_customPages", filters: ["search"]) {
      __id
      totalCount
      edges {
        node {
          id
          ...CustomPageItem_page
        }
      }
    }
  }
`

type Props = {
  queryReference: CustomPageList_query$key
  resetFilters: () => void
}

const CustomPageList: React.FC<Props> = ({ queryReference, resetFilters }) => {
  const intl = useIntl()
  const { contentRef } = useLayoutContext()
  const { data, loadNext, hasNext } = usePaginationFragment(FRAGMENT, queryReference)
  const pages = (data?.customPages?.edges ?? [])
    .map(edge => edge?.node)
    .filter((page): page is NonNullable<typeof page> => Boolean(page))

  return (
    <Table emptyMessage={<EmptyMessage onReset={resetFilters} />} style={{ border: 'none' }} onReset={resetFilters}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'global.title' })}</Table.Th>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'global.link' })}</Table.Th>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'global.published' })}</Table.Th>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'admin.fields.page.menu_items' })}</Table.Th>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'global.maj' })}</Table.Th>
          <Table.Th lineHeight="sm" display="flex" justifyContent="center">
            {intl.formatMessage({ id: 'link_actions' })}
          </Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody
        useInfiniteScroll={pages.length > 0}
        onScrollToBottom={() => loadNext(CONNECTION_NODES_PER_PAGE)}
        hasMore={hasNext}
        scrollParentRef={contentRef || undefined}
      >
        {pages.map(page => (
          <Table.Tr key={page.id} rowId={page.id}>
            <CustomPageItem page={page} connectionId={data.customPages.__id} />
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}

export default CustomPageList
