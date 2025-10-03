import * as React from 'react'
import Layout from '@components/BackOffice/Layout/Layout'
import { Flex, Spinner, CapUIIconSize } from '@cap-collectif/ui'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import { useIntl } from 'react-intl'
import { NextPage } from 'next'
import { PageProps } from 'types'
import ActivityLogPage from '@components/BackOffice/ActivityLog/ActivityLogPage'

const ActivityLog: NextPage<PageProps> = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'menu.activity-log' })}>
      <React.Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <ActivityLogPage />
      </React.Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default ActivityLog
