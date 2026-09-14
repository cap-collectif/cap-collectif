import * as React from 'react'
import { useIntl } from 'react-intl'
import Layout from '@components/BackOffice/Layout/Layout'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import FooterSocialNetworksList from '@components/BackOffice/FooterSocialNetworks/FooterSocialNetworksList'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'

const FooterSocialNetworks: React.FC = () => {
  const intl = useIntl()

  return (
    <Layout navTitle={intl.formatMessage({ id: 'admin.label.footer_social_network' })}>
      <React.Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <FooterSocialNetworksList />
      </React.Suspense>
    </Layout>
  )
}

export const getServerSideProps = withPageAuthRequired

export default FooterSocialNetworks
