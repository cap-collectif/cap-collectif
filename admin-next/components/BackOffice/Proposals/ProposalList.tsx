import { Table } from '@cap-collectif/ui'
import { useLayoutContext } from '@components/BackOffice/Layout/Layout.context'
import type { ProposalList_query$key } from '@relay/ProposalList_query.graphql'
import EmptyMessage from '@ui/Table/EmptyMessage'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, usePaginationFragment } from 'react-relay'
import ProposalItem from './ProposalItem'
import { CONNECTION_NODES_PER_PAGE } from './utils'

const FRAGMENT = graphql`
  fragment ProposalList_query on Query
  @argumentDefinitions(search: { type: "String" }, first: { type: "Int" }, cursor: { type: "String" })
  @refetchable(queryName: "ProposalListPaginationQuery") {
    adminProposals(search: $search, first: $first, after: $cursor)
      @connection(key: "ProposalList_adminProposals", filters: ["search"]) {
      edges {
        node {
          id
          ...ProposalItem_proposal
        }
      }
    }
  }
`

type Props = {
  queryReference: ProposalList_query$key
  term: string
  resetFilters: () => void
}

const ProposalList: React.FC<Props> = ({ queryReference, term, resetFilters }) => {
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

  const proposals = (data.adminProposals.edges ?? [])
    .map(edge => edge?.node)
    .filter((node): node is NonNullable<typeof node> => Boolean(node))

  return (
    <Table emptyMessage={<EmptyMessage onReset={resetFilters} />} style={{ border: 'none' }} onReset={resetFilters}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>{intl.formatMessage({ id: 'global.reference' })}</Table.Th>
          <Table.Th>{intl.formatMessage({ id: 'global.title' })}</Table.Th>
          <Table.Th>{intl.formatMessage({ id: 'global.author' })}</Table.Th>
          <Table.Th>{intl.formatMessage({ id: 'global.participative.project.label' })}</Table.Th>
          <Table.Th>{intl.formatMessage({ id: 'global.category' })}</Table.Th>
          <Table.Th>{intl.formatMessage({ id: 'proposal.district' })}</Table.Th>
          <Table.Th>{intl.formatMessage({ id: 'global.status' })}</Table.Th>
          <Table.Th>{intl.formatMessage({ id: 'global.state' })}</Table.Th>
          <Table.Th>{intl.formatMessage({ id: 'global.creation' })}</Table.Th>
          <Table.Th>{intl.formatMessage({ id: 'global.maj' })}</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody
        useInfiniteScroll={proposals.length > 0}
        onScrollToBottom={() => loadNext(CONNECTION_NODES_PER_PAGE)}
        hasMore={hasNext}
        scrollParentRef={contentRef || undefined}
      >
        {proposals.map(proposal => (
          <Table.Tr key={proposal.id} rowId={proposal.id}>
            <ProposalItem proposal={proposal} />
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}

export default ProposalList
