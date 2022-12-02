// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';

const AccessDenied = lazy(() =>
  import(/* webpackChunkName: "AccessDeniedProject" */ '~/components/AccessDenied/AccessDenied'),
);

export default () => (
  <Suspense fallback={null}>
    <Providers>
      <AccessDenied />
    </Providers>
  </Suspense>
);
