// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';

const AdminEventList = lazy(() =>
  import(
    /* webpackChunkName: "AdminEventList" */ '~/components/Admin/Event/EventList/AdminEventListQuery'
  ),
);

type Props = {|
  +isAdmin: boolean,
|};

export default ({ isAdmin }: Props) => (
  <Providers>
    <Suspense fallback={<Loader />}>
      <AdminEventList isAdmin={isAdmin} />
    </Suspense>
  </Providers>
);
