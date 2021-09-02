// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';
import { DashboardMailingListProvider } from '~/components/Admin/Emailing/EmailingList/DashboardMailingList/DashboardMailingList.context';
import AlertBoxApp from '~/startup/AlertBoxApp';

const EmailingListPage = lazy(() =>
  import(
    /* webpackChunkName: "EmailingListPage" */ '~/components/Admin/Emailing/EmailingList/EmailingListPage'
  ),
);

export default () => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <AlertBoxApp />
      <DashboardMailingListProvider>
        <EmailingListPage />
      </DashboardMailingListProvider>
    </Providers>
  </Suspense>
);
