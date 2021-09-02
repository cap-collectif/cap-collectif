// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';

const MapAdminPage = lazy(() =>
  import(/* webpackChunkName: "MapAdminPage" */ '~/components/User/Admin/MapAdminPage'),
);

export default (props: {}) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <MapAdminPage {...props} />
    </Providers>
  </Suspense>
);
