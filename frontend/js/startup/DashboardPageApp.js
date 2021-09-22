// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import DashboardPagePlaceholder from '~/components/Admin/Dashboard/DashboardPagePlaceholder';

const DashboardPageQuery = lazy(() =>
  import(
    /* webpackChunkName: "DashboardPageQuery" */ '~/components/Admin/Dashboard/DashboardPageQuery'
  ),
);

type Props = {|
  +isAdmin: boolean
|}

export default ({ isAdmin }: Props) => (
  <Providers>
    <Suspense fallback={<DashboardPagePlaceholder />}>
      <DashboardPageQuery isAdmin={isAdmin} />
    </Suspense>
  </Providers>
);
