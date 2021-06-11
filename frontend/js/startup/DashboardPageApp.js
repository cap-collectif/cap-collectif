// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';

const DashboardPageQuery = lazy(() =>
  import(
    /* webpackChunkName: "DashboardPageQuery" */ '~/components/Admin/Dashboard/DashboardPageQuery'
  ),
);

export default () => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <DashboardPageQuery />
    </Providers>
  </Suspense>
);
