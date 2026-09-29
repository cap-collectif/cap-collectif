import { Table } from '@cap-collectif/ui'
import { useLayoutContext } from '@components/BackOffice/Layout/Layout.context'
import { NewsletterSubscriptionList_query$key } from '@relay/NewsletterSubscriptionList_query.graphql'
import EmptyMessage from '@ui/Table/EmptyMessage'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, RefetchFnDynamic, usePaginationFragment } from 'react-relay'
import { OperationType } from 'relay-runtime'
import NewsletterSubscriptionItem from './NewsletterSubscriptionItem'
import { CONNECTION_NODES_PER_PAGE } from './utils'

const FRAGMENT = graphql`
  fragment NewsletterSubscriptionList_query on Query
  @argumentDefinitions(search: { type: "String" }, first: { type: "Int" }, cursor: { type: "String" })
  @refetchable(queryName: "NewsletterSubscriptionListPaginationQuery") {
    newsletterSubscriptions(search: $search, first: $first, after: $cursor)
      @connection(key: "NewsletterSubscriptionList_newsletterSubscriptions", filters: ["search"]) {
      __id
      edges {
        node {
          id
          ...NewsletterSubscriptionItem_newsletterSubscription
        }
      }
    }
  }
`

type Props = {
  queryReference: NewsletterSubscriptionList_query$key
  resetFilters: () => void
  search: string | null
  setRefetch: React.Dispatch<
    React.SetStateAction<RefetchFnDynamic<OperationType, NewsletterSubscriptionList_query$key> | null>
  >
}

const NewsletterSubscriptionList: React.FC<Props> = ({ queryReference, resetFilters, search, setRefetch }) => {
  const intl = useIntl()
  const { contentRef } = useLayoutContext()
  const { data, loadNext, hasNext, refetch } = usePaginationFragment(FRAGMENT, queryReference)
  const connectionId = data.newsletterSubscriptions.__id
  const newsletterSubscriptions = (data.newsletterSubscriptions.edges ?? [])
    .map(edge => edge?.node)
    .filter((node): node is NonNullable<typeof node> => Boolean(node))

  // Lifted so the page-level create modal (a sibling of this list) can also trigger a refetch.
  React.useEffect(() => {
    setRefetch(() => refetch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetch])

  return (
    <Table emptyMessage={<EmptyMessage onReset={resetFilters} />} style={{ border: 'none' }} onReset={resetFilters}>
      <Table.Thead>
        <Table.Tr>
          <Table.Th lineHeight="sm">
            {intl.formatMessage({ id: 'admin.fields.newsletter_subscription.email' })}
          </Table.Th>
          <Table.Th lineHeight="sm">
            {intl.formatMessage({ id: 'admin.fields.newsletter_subscription.is_enabled' })}
          </Table.Th>
          <Table.Th lineHeight="sm">
            {intl.formatMessage({ id: 'admin.fields.newsletter_subscription.created_at' })}
          </Table.Th>
          <Table.Th lineHeight="sm" display="flex" justifyContent="center">
            {intl.formatMessage({ id: 'admin.settings.header.action' })}
          </Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody
        useInfiniteScroll={newsletterSubscriptions.length > 0}
        onScrollToBottom={() => loadNext(CONNECTION_NODES_PER_PAGE)}
        hasMore={hasNext}
        scrollParentRef={contentRef || undefined}
      >
        {newsletterSubscriptions.map(newsletterSubscription => (
          // rowId lets the Table count rows (emptyMessage). It is prefixed because the raw integer id would be
          // reordered by Object.keys() inside CapUI's Tbody, which then re-registers the rows in an infinite loop.
          <Table.Tr key={newsletterSubscription.id} rowId={`newsletter-subscription-${newsletterSubscription.id}`}>
            <NewsletterSubscriptionItem
              newsletterSubscription={newsletterSubscription}
              connectionId={connectionId}
              refetch={refetch}
              search={search}
            />
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  )
}

export default NewsletterSubscriptionList
