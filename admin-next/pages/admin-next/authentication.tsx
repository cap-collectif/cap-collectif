import Layout from '@components/BackOffice/Layout/Layout'
import { useIntl } from 'react-intl'
import { Suspense } from 'react'
import AuthenticationMethods from '@components/BackOffice/Authentication/AuthenticationMethods'
import { Flex } from '@cap-collectif/ui'
import Shield from '@components/BackOffice/Authentication/Shield'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import AuthenticationMethodsPlaceholder from '@components/BackOffice/Authentication/AuthenticationMethodsPlaceholder'
import ShieldPlaceholder from '@components/BackOffice/Authentication/ShieldPlaceholder'

const Authentication = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'admin.group.authentication' })}>
      <Flex direction="row" justify="space-between" spacing={6}>
        <Suspense fallback={<AuthenticationMethodsPlaceholder />}>
          <AuthenticationMethods />
        </Suspense>

        <Suspense fallback={<ShieldPlaceholder />}>
          <Shield />
        </Suspense>
      </Flex>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default Authentication
