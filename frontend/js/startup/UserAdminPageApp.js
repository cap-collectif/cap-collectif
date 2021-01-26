// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import type { Props } from '~/components/User/Admin/UserAdminPage';
import Loader from '~ui/FeedbacksIndicators/Loader';

const UserAdminPage = lazy(() => import(/* webpackChunkName: "UserAdminPage" */ '~/components/User/Admin/UserAdminPage'));

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <UserAdminPage {...props} />
    </Providers>
  </Suspense>
);
