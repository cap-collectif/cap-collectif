import * as React from 'react'
import { Suspense } from 'react'
import { useIntl } from 'react-intl'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import Layout from '@components/BackOffice/Layout/Layout'
import NotificationSettingsList from '@components/BackOffice/NotificationSettings/NotificationSettingsList'
import { withFeatureFlagRequired } from '@utils/withPageAuthRequired'

const NotificationSettings: React.FC = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'admin.label.settings.notifications' })}>
      <Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <NotificationSettingsList />
      </Suspense>
    </Layout>
  )
}

export const getServerSideProps = withFeatureFlagRequired(
  'unstable__sonata_migration_to_admin_next',
  '/admin/settings/settings.notifications/list',
)

export default NotificationSettings
