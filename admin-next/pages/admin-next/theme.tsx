import * as React from 'react'
import Layout from '@components/BackOffice/Layout/Layout'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import { withFeatureFlagRequired } from '@utils/withPageAuthRequired'
import useUrlState from '@hooks/useUrlState'
import ThemeFormWrapper, { ThemeFormWrapperWithData } from '@components/BackOffice/Themes/ThemeFormWrapper'

const Theme = (): React.JSX.Element => {
  const [idFromUrl] = useUrlState('id', '')

  return (
    <Layout navTitle={''}>
      <React.Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        {idFromUrl ? <ThemeFormWrapperWithData themeId={idFromUrl} /> : <ThemeFormWrapper />}
      </React.Suspense>
    </Layout>
  )
}

export const getServerSideProps = withFeatureFlagRequired(
  'unstable__sonata_migration_to_admin_next',
  '/admin/capco/app/theme/list',
)

export default Theme
