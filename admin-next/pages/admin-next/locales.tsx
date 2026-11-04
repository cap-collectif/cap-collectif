import type { GetServerSideProps } from 'next'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import Layout from '@components/BackOffice/Layout/Layout'
import LocalesList from '@components/BackOffice/Locales/LocalesList'
import { withFeatureFlagRequired } from '@utils/withPageAuthRequired'
import * as React from 'react'
import { Suspense } from 'react'
import { useIntl } from 'react-intl'

const Locales: React.FC = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'global-languages' })}>
      <Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <LocalesList />
      </Suspense>
    </Layout>
  )
}

const withMigrationFlag = withFeatureFlagRequired('unstable__sonata_migration_to_admin_next', '/admin/locale/list')

export const getServerSideProps: GetServerSideProps = async context => {
  const result = await withMigrationFlag(context)
  if ('props' in result && 'featureFlags' in result.props && !result.props.featureFlags.multilangue) {
    return { redirect: { destination: '/', permanent: false } }
  }
  return result
}

export default Locales
