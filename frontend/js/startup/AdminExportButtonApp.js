// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';

const AdminExportButton = lazy(() => import('~/components/Event/Admin/AdminExportButton'));

export default () => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <AdminExportButton />
    </Providers>
  </Suspense>
);
