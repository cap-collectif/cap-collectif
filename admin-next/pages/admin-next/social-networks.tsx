import * as React from 'react'
import { FC, Suspense } from 'react'
import { useIntl } from 'react-intl'
import Layout from '@components/BackOffice/Layout/Layout'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import SocialNetworkList from '@components/BackOffice/SocialNetwork/SocialNetworkList'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'

const SocialNetworks: FC = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'admin.label.social_network' })}>
      <Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <SocialNetworkList />
      </Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default SocialNetworks
