import * as React from 'react'
import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import Layout from '@components/BackOffice/Layout/Layout'
import useUrlState from '@hooks/useUrlState'
import EmailingCampaignFormWrapper from '@components/BackOffice/Emailing/EmailingCampaign/EmailingCampaignFormWrapper'
import { SONATA_EMAILING_CAMPAIGNS_URL, withEmailingPageRequired } from '@components/BackOffice/Emailing/utils'

const EmailingCampaign: React.FC = () => {
  const [idFromUrl] = useUrlState('id', '')

  return (
    <Layout navTitle="">
      <React.Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        {idFromUrl ? <EmailingCampaignFormWrapper emailingCampaignId={idFromUrl} /> : null}
      </React.Suspense>
    </Layout>
  )
}

// A campaign is created from the list, which then redirects here
export const getServerSideProps = withEmailingPageRequired(SONATA_EMAILING_CAMPAIGNS_URL)

export default EmailingCampaign
