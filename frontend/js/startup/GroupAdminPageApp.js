// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import type { Props } from '~/components/Group/Admin/GroupAdminPage';
import Loader from '~ui/FeedbacksIndicators/Loader';

const GroupAdminPage = lazy(() => import('~/components/Group/Admin/GroupAdminPage'));

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <GroupAdminPage {...props} />
    </Providers>
  </Suspense>
);
