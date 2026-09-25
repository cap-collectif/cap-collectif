import * as React from 'react'
import { Suspense } from 'react'
import { useIntl } from 'react-intl'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import Layout from '@components/BackOffice/Layout/Layout'
import LoginSettingsList from '@components/BackOffice/LoginSettings/LoginSettingsList'
import { withFeatureFlagRequired } from '@utils/withPageAuthRequired'

const LoginSettings: React.FC = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'admin.label.pages.login' })}>
      <Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <LoginSettingsList />
      </Suspense>
    </Layout>
  )
}

export const getServerSideProps = withFeatureFlagRequired(
  'unstable__sonata_migration_to_admin_next',
  '/admin/settings/pages.login/list',
)

export default LoginSettings
