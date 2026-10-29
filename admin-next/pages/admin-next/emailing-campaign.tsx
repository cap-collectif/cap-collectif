import { CapUIIconSize, Flex, Spinner } from '@cap-collectif/ui'
import EmailingCampaignFormWrapper from '@components/BackOffice/Emailing/EmailingCampaign/EmailingCampaignFormWrapper'
import { withEmailingPageRequired } from '@components/BackOffice/Emailing/utils'
import Layout from '@components/BackOffice/Layout/Layout'
import useUrlState from '@hooks/useUrlState'
import * as React from 'react'

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

export const getServerSideProps = withEmailingPageRequired

export default EmailingCampaign
