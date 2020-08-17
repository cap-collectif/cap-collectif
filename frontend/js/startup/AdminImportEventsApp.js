// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';

const AdminImportEventsButton = lazy(() =>
  import('~/components/Event/Admin/AdminImportEventsButton'),
);

export default () => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <AdminImportEventsButton />
    </Providers>
  </Suspense>
);
