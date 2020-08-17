// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';

const ProjectRestrictedAccess = lazy(() =>
  import('~/components/Project/Page/ProjectRestrictedAccess'),
);

export default (props: { projectId: string }) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <ProjectRestrictedAccess {...props} />
    </Providers>
  </Suspense>
);
