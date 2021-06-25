// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import DashboardPagePlaceholder from '~/components/Admin/Dashboard/DashboardPagePlaceholder';

const DashboardPageQuery = lazy(() =>
  import(
    /* webpackChunkName: "DashboardPageQuery" */ '~/components/Admin/Dashboard/DashboardPageQuery'
  ),
);

export default () => (
  <Providers>
    <Suspense fallback={<DashboardPagePlaceholder />}>
      <DashboardPageQuery />
    </Suspense>
  </Providers>
);
