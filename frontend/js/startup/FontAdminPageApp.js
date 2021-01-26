// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';

const FontAdminPage = lazy(() => import(/* webpackChunkName: "FontAdminPage" */ '~/components/Admin/Font/FontAdminPage'));

export default () => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <FontAdminPage />
    </Providers>
  </Suspense>
);
