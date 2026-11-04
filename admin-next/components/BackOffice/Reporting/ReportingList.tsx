import { Table, Text } from '@cap-collectif/ui'
import { useLayoutContext } from '@components/BackOffice/Layout/Layout.context'
import type { ReportingList_query$key } from '@relay/ReportingList_query.graphql'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, usePaginationFragment } from 'react-relay'
import ReportingItem from './ReportingItem'
import { CONNECTION_NODES_PER_PAGE } from './utils'

const FRAGMENT = graphql`
  fragment ReportingList_query on Query
  @argumentDefinitions(first: { type: "Int" }, cursor: { type: "String" })
  @refetchable(queryName: "ReportingListPaginationQuery") {
    reportings(first: $first, after: $cursor) @connection(key: "ReportingList_reportings") {
      edges {
        node {
          id
          ...ReportingItem_reporting
        }
      }
    }
  }
`

type Props = {
  queryReference: ReportingList_query$key
  onShow: (id: string) => void
}

const ReportingList: React.FC<Props> = ({ queryReference, onShow }) => {
  const intl = useIntl()
  const { contentRef } = useLayoutContext()
  const { data, loadNext, hasNext } = usePaginationFragment(FRAGMENT, queryReference)
  const reportings = (data.reportings.edges ?? [])
    .map(edge => edge?.node)
    .filter((node): node is NonNullable<typeof node> => Boolean(node))

  return (
    <Table emptyMessage={<Text>{intl.formatMessage({ id: 'no_result' })}</Text>} style={{ border: 'none' }}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'admin.fields.reporting.object' })}</Table.Th>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'admin.fields.reporting.type' })}</Table.Th>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'admin.fields.reporting.status' })}</Table.Th>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'admin.fields.reporting.is_archived' })}</Table.Th>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'global.author' })}</Table.Th>
          <Table.Th lineHeight="sm">{intl.formatMessage({ id: 'global.creation' })}</Table.Th>
          <Table.Th />
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody
        useInfiniteScroll={reportings.length > 0}
        onScrollToBottom={() => loadNext(CONNECTION_NODES_PER_PAGE)}
        hasMore={hasNext}
        scrollParentRef={contentRef || undefined}
      >
        {reportings.map(reporting => (
          // Reporting ids are integers: a numeric rowId makes Table.Tbody loop (see REFONTE_SONATA.md)
          <Table.Tr key={reporting.id} rowId={`reporting-${reporting.id}`}>
            <ReportingItem reporting={reporting} onShow={onShow} />
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}

export default ReportingList
