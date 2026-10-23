import * as React from 'react'
import { Suspense } from 'react'
import { useIntl } from 'react-intl'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import Layout from '@components/BackOffice/Layout/Layout'
import SiteFaviconForm from '@components/BackOffice/SiteFavicon/SiteFaviconForm'
import { withFeatureFlagRequired } from '@utils/withPageAuthRequired'

const SiteFavicon: React.FC = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'website-icon' })}>
      <Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <SiteFaviconForm />
      </Suspense>
    </Layout>
  )
}

export const getServerSideProps = withFeatureFlagRequired(
  'unstable__sonata_migration_to_admin_next',
  '/admin/favicon/list',
)

export default SiteFavicon
