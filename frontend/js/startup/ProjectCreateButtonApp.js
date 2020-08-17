// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';

const ProjectCreateButton = lazy(() => import('~/components/Admin/Project/ProjectCreateButton'));

export default () => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <ProjectCreateButton />
    </Providers>
  </Suspense>
);
