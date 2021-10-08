// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';

const AdminProjectListApp = lazy(() =>
  import(
    /* webpackChunkName: "AdminProjectListApp" */ '~/components/Admin/Project/list/ProjectListQuery'
  ),
);

type Props = {|
  +isAdmin: boolean,
|};

export default ({ isAdmin }: Props) => (
  <Providers>
    <Suspense fallback={<Loader />}>
      <AdminProjectListApp isAdmin={isAdmin} />
    </Suspense>
  </Providers>
);
