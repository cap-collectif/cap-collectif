import * as React from 'react'
import { Suspense } from 'react'
import { useIntl } from 'react-intl'
import Layout from '@components/BackOffice/Layout/Layout'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import PerformanceSettingsList from '@components/BackOffice/PerformanceSettings/PerformanceSettingsList'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'

const PerformanceSettings: React.FC = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'admin.label.settings.performance' })}>
      <Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <PerformanceSettingsList />
      </Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default PerformanceSettings
