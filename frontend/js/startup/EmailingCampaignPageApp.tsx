// @ts-nocheck
import React, { lazy, Suspense } from 'react'
import Providers from './Providers'
import Loader from '~ui/FeedbacksIndicators/Loader'
import { DashboardCampaignProvider } from '~/components/Admin/Emailing/EmailingCampaign/DashboardCampaign/DashboardCampaign.context'

const EmailingCampaignPage = lazy(
  () =>
    import(
      /* webpackChunkName: "EmailingCampaignPage" */
      '~/components/Admin/Emailing/EmailingCampaign/EmailingCampaignPage'
    ),
)
export default () => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <DashboardCampaignProvider>
        <EmailingCampaignPage />
      </DashboardCampaignProvider>
    </Providers>
  </Suspense>
)
