// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';
import { DashboardCampaignProvider } from '~/components/Admin/Emailing/EmailingCampaign/DashboardCampaign/DashboardCampaign.context';
import AlertBoxApp from '~/startup/AlertBoxApp';

const EmailingCampaignPage = lazy(() =>
  import('~/components/Admin/Emailing/EmailingCampaign/EmailingCampaignPage'),
);

export default () => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <AlertBoxApp />
      <DashboardCampaignProvider>
        <EmailingCampaignPage />
      </DashboardCampaignProvider>
    </Providers>
  </Suspense>
);
