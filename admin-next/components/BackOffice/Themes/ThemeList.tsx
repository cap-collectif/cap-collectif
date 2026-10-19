import { Table } from '@cap-collectif/ui'
import { useLayoutContext } from '@components/BackOffice/Layout/Layout.context'
import { ThemeList_query$key } from '@relay/ThemeList_query.graphql'
import EmptyMessage from '@ui/Table/EmptyMessage'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, usePaginationFragment } from 'react-relay'
import { CONNECTION_NODES_PER_PAGE } from './utils'
import ThemeItem from './ThemeItem'

const FRAGMENT = graphql`
  fragment ThemeList_query on Query
  @argumentDefinitions(search: { type: "String" }, first: { type: "Int" }, cursor: { type: "String" })
  @refetchable(queryName: "ThemeListPaginationQuery") {
    adminThemes(search: $search, first: $first, after: $cursor)
      @connection(key: "ThemeList_adminThemes", filters: ["search"]) {
      __id
      totalCount
      edges {
        node {
          id
          ...ThemeItem_theme
        }
      }
    }
  }
`

type Props = {
  queryReference: ThemeList_query$key
  term: string
  resetFilters: () => void
}

const ThemeList: React.FC<Props> = ({ queryReference, term, resetFilters }) => {
  const intl = useIntl()
  const { contentRef } = useLayoutContext()
  const { data, loadNext, hasNext, refetch } = usePaginationFragment(FRAGMENT, queryReference)
  const firstRendered = React.useRef<true | null>(null)

  React.useEffect(() => {
    if (firstRendered.current) {
      refetch({ search: term || null, first: CONNECTION_NODES_PER_PAGE })
    }

    firstRendered.current = true
  }, [term, refetch])
  const themes = (data?.adminThemes?.edges ?? [])
    .map(edge => edge?.node)
    .filter((theme): theme is NonNullable<typeof theme> => Boolean(theme))

  return (
    <Table emptyMessage={<EmptyMessage onReset={resetFilters} />} style={{ border: 'none' }} onReset={resetFilters}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'global.title' })}</Table.Th>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'global.author' })}</Table.Th>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'global.status' })}</Table.Th>
          <Table.Th lineHeight="sm" isNumeric textAlign="left">
            {intl.formatMessage({ id: 'global.position' })}
          </Table.Th>
          <Table.Th lineHeight="sm" isNumeric textAlign="left">
            {intl.formatMessage({ id: 'global.events' })}
          </Table.Th>
          <Table.Th lineHeight="sm" isNumeric textAlign="left">
            {intl.formatMessage({ id: 'global.articles' })}
          </Table.Th>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'global.published' })}</Table.Th>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'global.maj' })}</Table.Th>
          <Table.Th lineHeight="sm" display="flex" justifyContent="center">
            {intl.formatMessage({ id: 'admin.settings.header.action' })}
          </Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody
        useInfiniteScroll={themes.length > 0}
        onScrollToBottom={() => loadNext(CONNECTION_NODES_PER_PAGE)}
        hasMore={hasNext}
        scrollParentRef={contentRef || undefined}
      >
        {themes.map(theme => (
          <Table.Tr key={theme.id} rowId={`theme-${theme.id}`}>
            <ThemeItem theme={theme} connectionId={data.adminThemes.__id} />
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}

export default ThemeList
