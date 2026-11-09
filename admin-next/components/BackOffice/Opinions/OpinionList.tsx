import { Table } from '@cap-collectif/ui'
import { useLayoutContext } from '@components/BackOffice/Layout/Layout.context'
import { OpinionList_query$key } from '@relay/OpinionList_query.graphql'
import EmptyMessage from '@ui/Table/EmptyMessage'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, usePaginationFragment } from 'react-relay'
import OpinionItem from './OpinionItem'
import { CONNECTION_NODES_PER_PAGE } from './utils'

const FRAGMENT = graphql`
  fragment OpinionList_query on Query
  @argumentDefinitions(search: { type: "String" }, first: { type: "Int" }, cursor: { type: "String" })
  @refetchable(queryName: "OpinionListPaginationQuery") {
    adminOpinions(search: $search, first: $first, after: $cursor)
      @connection(key: "OpinionList_adminOpinions", filters: ["search"]) {
      __id
      totalCount
      edges {
        node {
          id
          ...OpinionItem_opinion
        }
      }
    }
  }
`

// Widths add up to 100%, sized so that the headers and the dates fit on a 1440px wide screen
const COLUMNS: ReadonlyArray<{ label: string | null; width: string }> = [
  { label: 'global.title', width: '11.5%' },
  { label: 'global.author', width: '9%' },
  { label: 'global.participative.project.label', width: '11.5%' },
  { label: 'global.category', width: '9%' },
  { label: 'global.consultation', width: '9.5%' },
  { label: 'global.vote', width: '5%' },
  { label: 'global.position', width: '6.5%' },
  { label: 'global.published', width: '6%' },
  { label: 'global.pinned.label', width: '6%' },
  { label: 'global.is_trashed', width: '8.5%' },
  { label: 'global.maj', width: '8.5%' },
  // Only ButtonQuickActions: no label
  { label: null, width: '9%' },
]

type Props = {
  queryReference: OpinionList_query$key
  resetFilters: () => void
}

const OpinionList: React.FC<Props> = ({ queryReference, resetFilters }) => {
  const intl = useIntl()
  const { contentRef } = useLayoutContext()
  const { data, loadNext, hasNext } = usePaginationFragment(FRAGMENT, queryReference)
  const opinions = (data?.adminOpinions?.edges ?? [])
    .map(edge => edge?.node)
    .filter((opinion): opinion is NonNullable<typeof opinion> => Boolean(opinion))

  return (
    <Table
      emptyMessage={<EmptyMessage onReset={resetFilters} />}
      style={{ border: 'none' }}
      onReset={resetFilters}
      // Twelve columns: fixed widths so that the table never exceeds its container, long words are broken
      // instead, and the horizontal padding of the cells is halved
      sx={{
        tableLayout: 'fixed',
        '.cap-table__th, .cap-table__td': { px: 'xs', overflowWrap: 'anywhere' },
      }}
    >
      <Table.Thead>
        <Table.Tr>
          {COLUMNS.map(({ label, width }) => (
            <Table.Th key={label ?? 'actions'} lineHeight="sm" width={width}>
              {label ? intl.formatMessage({ id: label }) : null}
            </Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody
        useInfiniteScroll={opinions.length > 0}
        onScrollToBottom={() => loadNext(CONNECTION_NODES_PER_PAGE)}
        hasMore={hasNext}
        scrollParentRef={contentRef || undefined}
      >
        {opinions.map(opinion => (
          <Table.Tr key={opinion.id} rowId={opinion.id}>
            <OpinionItem opinion={opinion} connectionId={data.adminOpinions.__id} />
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}

export default OpinionList
