// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';
import { DashboardMailingListProvider } from '~/components/Admin/Emailing/EmailingList/DashboardMailingList/DashboardMailingList.context';

const EmailingListPage = lazy(() =>
  import('~/components/Admin/Emailing/EmailingList/EmailingListPage'),
);

export default () => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <DashboardMailingListProvider>
        <EmailingListPage />
      </DashboardMailingListProvider>
    </Providers>
  </Suspense>
);
