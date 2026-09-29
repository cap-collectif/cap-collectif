import { Button, CapUIIcon, CapUIIconSize, Flex, Search, Spinner } from '@cap-collectif/ui'
import Layout from '@components/BackOffice/Layout/Layout'
import NewsletterSubscriptionList from '@components/BackOffice/NewsletterSubscriptions/NewsletterSubscriptionList'
import NewsletterSubscriptionModal from '@components/BackOffice/NewsletterSubscriptions/NewsletterSubscriptionModal'
import { CONNECTION_NODES_PER_PAGE, getConnectionId } from '@components/BackOffice/NewsletterSubscriptions/utils'
import { newsletterSubscriptions_Query } from '@relay/newsletterSubscriptions_Query.graphql'
import { NewsletterSubscriptionList_query$key } from '@relay/NewsletterSubscriptionList_query.graphql'
import debounce from '@shared/utils/debounce-promise'
import TablePlaceholder from '@ui/Table/TablePlaceholder'
import downloadCSV from '@utils/download-csv'
import { withFeatureFlagRequired } from '@utils/withPageAuthRequired'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, GraphQLTaggedNode, RefetchFnDynamic, useLazyLoadQuery } from 'react-relay'
import { OperationType } from 'relay-runtime'

const QUERY: GraphQLTaggedNode = graphql`
  query newsletterSubscriptions_Query($search: String, $first: Int) {
    ...NewsletterSubscriptionList_query @arguments(search: $search, first: $first)
  }
`

const EXPORT_URL = '/export-newsletter-subscriptions'

const NewsletterSubscriptionsTab: React.FC = () => {
  const intl = useIntl()
  const [term, setTerm] = React.useState<string>('')
  const [isExporting, setIsExporting] = React.useState(false)
  // Lifted from the list (a Suspense-wrapped descendant) so the create modal, a sibling of the list,
  // can also refetch it after a successful creation. Null until the list has mounted.
  const [refetch, setRefetch] = React.useState<RefetchFnDynamic<
    OperationType,
    NewsletterSubscriptionList_query$key
  > | null>(null)
  const search = term || null

  const onTermChange = debounce((value: string) => setTerm(value), 400)

  const queryReference = useLazyLoadQuery<newsletterSubscriptions_Query>(QUERY, {
    search,
    first: CONNECTION_NODES_PER_PAGE,
  })

  const onExport = async () => {
    setIsExporting(true)
    await downloadCSV(EXPORT_URL, intl)
    setIsExporting(false)
  }

  return (
    <Flex direction="column" width="100%" spacing={6} bg="white" borderRadius="accordion" p={8} justify="flex-start">
      <Flex alignItems="center" spacing={6}>
        <NewsletterSubscriptionModal
          connectionId={getConnectionId(search)}
          refetch={refetch}
          search={search}
          disclosure={
            <Button variant="primary" variantColor="primary" variantSize="small" leftIcon={CapUIIcon.Add}>
              {intl.formatMessage({ id: 'admin.newsletter-subscriptions.create' })}
            </Button>
          }
        />
        <Button
          variant="secondary"
          variantColor="primary"
          variantSize="small"
          leftIcon={CapUIIcon.Download}
          isLoading={isExporting}
          onClick={onExport}
        >
          {intl.formatMessage({ id: 'admin.newsletter-subscriptions.export' })}
        </Button>
        <Search
          onChange={onTermChange}
          value={term}
          placeholder={intl.formatMessage({ id: 'admin.newsletter-subscriptions.search' })}
          aria-label={intl.formatMessage({ id: 'admin.newsletter-subscriptions.search' })}
        />
      </Flex>

      <React.Suspense fallback={<TablePlaceholder rowsCount={20} columnsCount={4} />}>
        <NewsletterSubscriptionList
          queryReference={queryReference}
          resetFilters={() => setTerm('')}
          search={search}
          setRefetch={setRefetch}
        />
      </React.Suspense>
    </Flex>
  )
}

export const getServerSideProps = withFeatureFlagRequired(
  'unstable__sonata_migration_to_admin_next',
  // Sonata route retained during the Admin Next migration rollout. Remove it with the migration feature flag.
  '/admin/capco/app/newslettersubscription/list',
)

const NewsletterSubscriptionsPage: React.FC = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'admin.label.newsletter_subscription' })}>
      <React.Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <NewsletterSubscriptionsTab />
      </React.Suspense>
    </Layout>
  )
}

export default NewsletterSubscriptionsPage
