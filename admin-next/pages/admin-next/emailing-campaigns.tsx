import * as React from 'react'
import { useIntl } from 'react-intl'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import Layout from '@components/BackOffice/Layout/Layout'
import EmailingCampaignsPage from '@components/BackOffice/Emailing/EmailingCampaigns/EmailingCampaignsPage'
import { SONATA_EMAILING_CAMPAIGNS_URL, withEmailingPageRequired } from '@components/BackOffice/Emailing/utils'

const EmailingCampaigns: React.FC = () => {
  const intl = useIntl()

  return (
    <Layout
      navTitle={`${intl.formatMessage({ id: 'admin-menu-campaign-list' })} (${intl.formatMessage({
        id: 'global.beta',
      })})`}
    >
      <React.Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <EmailingCampaignsPage />
      </React.Suspense>
    </Layout>
  )
}

export const getServerSideProps = withEmailingPageRequired(SONATA_EMAILING_CAMPAIGNS_URL)

export default EmailingCampaigns
