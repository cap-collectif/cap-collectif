import { Suspense } from 'react'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import Layout from '@components/BackOffice/Layout/Layout'
import FooterSettingsList from '@components/BackOffice/FooterSettings/FooterSettingsList'
import { withFeatureFlagRequired } from '@utils/withPageAuthRequired'
import { useIntl } from 'react-intl'

const FooterSettings = () => {
  const intl = useIntl()
  return (
    <Layout navTitle={intl.formatMessage({ id: 'admin.label.pages.footer' })}>
      <Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <FooterSettingsList />
      </Suspense>
    </Layout>
  )
}

export const getServerSideProps = withFeatureFlagRequired(
  'unstable__sonata_migration_to_admin_next',
  '/admin/settings/pages.footer/list',
)
export default FooterSettings
