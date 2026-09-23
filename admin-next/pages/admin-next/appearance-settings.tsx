import * as React from 'react'
import { Suspense } from 'react'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import Layout from '@components/BackOffice/Layout/Layout'
import AppearanceSettingsList from '@components/BackOffice/AppearanceSettings/AppearanceSettingsList'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import { useIntl } from 'react-intl'

const AppearanceSettings: React.FC = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'admin.label.settings.appearance' })}>
      <Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <AppearanceSettingsList />
      </Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired
export default AppearanceSettings
