import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import Layout from '@components/BackOffice/Layout/Layout'
import FontsList from '@components/BackOffice/Fonts/FontsList'
import { withFeatureFlagRequired } from '@utils/withPageAuthRequired'
import * as React from 'react'
import { Suspense } from 'react'
import { useIntl } from 'react-intl'

const Fonts: React.FC = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'global-typeface' })}>
      <Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <FontsList />
      </Suspense>
    </Layout>
  )
}

export const getServerSideProps = withFeatureFlagRequired(
  'unstable__sonata_migration_to_admin_next',
  '/admin/font/list',
)

export default Fonts
