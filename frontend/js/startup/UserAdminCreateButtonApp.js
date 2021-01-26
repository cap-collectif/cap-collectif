// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';

const UserAdminCreateButton = lazy(() => import(/* webpackChunkName: "UserAdminCreateButton" */ '~/components/User/Admin/UserAdminCreateButton'));

export default () => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <UserAdminCreateButton />
    </Providers>
  </Suspense>
);
