// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';

const AuthentificationAdminPage = lazy(() =>
  import(
    /* webpackChunkName: "AuthentificationAdminPage" */ '~/components/Admin/Authentification/AuthentificationAdminPage'
  ),
);

export default () => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <AuthentificationAdminPage />
    </Providers>
  </Suspense>
);
