// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';

const AccessDeniedAuth = lazy(() =>
  import(/* webpackChunkName: "AccessDeniedAuth" */ '~/components/Project/AccessDeniedAuth'),
);

export default () => (
  <Suspense fallback={null}>
    <Providers>
      <AccessDeniedAuth />
    </Providers>
  </Suspense>
);
