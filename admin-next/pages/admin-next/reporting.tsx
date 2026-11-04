import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import Layout from '@components/BackOffice/Layout/Layout'
import ReportingList from '@components/BackOffice/Reporting/ReportingList'
import ReportingModal from '@components/BackOffice/Reporting/ReportingModal'
import { CONNECTION_NODES_PER_PAGE } from '@components/BackOffice/Reporting/utils'
import type { reporting_Query } from '@relay/reporting_Query.graphql'
import { withFeatureFlagRequired } from '@utils/withPageAuthRequired'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'

const QUERY = graphql`
  query reporting_Query($first: Int) {
    ...ReportingList_query @arguments(first: $first)
  }
`

const ReportingTab: React.FC = () => {
  const queryReference = useLazyLoadQuery<reporting_Query>(QUERY, { first: CONNECTION_NODES_PER_PAGE })
  // `?id=` opens the reporting directly: the former Sonata show page, linked from the reporting e-mail, redirects here
  const [reportingId, setReportingId] = React.useState<string | null>(() =>
    new URL(window.location.href).searchParams.get('id'),
  )

  const closeModal = () => {
    setReportingId(null)
    const url = new URL(window.location.href)
    if (url.searchParams.has('id')) {
      url.searchParams.delete('id')
      window.history.replaceState(null, '', url.toString())
    }
  }

  return (
    <Flex direction="column" width="100%" spacing={6} bg="white" borderRadius="accordion" p={8} justify="flex-start">
      <ReportingList queryReference={queryReference} onShow={setReportingId} />
      {reportingId && <ReportingModal reportingId={reportingId} onClose={closeModal} />}
    </Flex>
  )
}

const ReportingPage: React.FC = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'admin.label.reporting' })}>
      <React.Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <ReportingTab />
      </React.Suspense>
    </Layout>
  )
}

export const getServerSideProps = withFeatureFlagRequired(
  'unstable__sonata_migration_to_admin_next',
  '/admin/reporting',
)

export default ReportingPage
