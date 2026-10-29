import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import EmailingCampaignsPage from '@components/BackOffice/Emailing/EmailingCampaigns/EmailingCampaignsPage'
import { withEmailingPageRequired } from '@components/BackOffice/Emailing/utils'
import Layout from '@components/BackOffice/Layout/Layout'
import * as React from 'react'
import { useIntl } from 'react-intl'

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

export const getServerSideProps = withEmailingPageRequired

export default EmailingCampaigns
