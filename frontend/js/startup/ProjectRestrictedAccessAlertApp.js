// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';

const ProjectRestrictedAccessAlert = lazy(() =>
  import(/* webpackChunkName: "ProjectRestrictedAccessAlert" */ '~/components/Project/Page/ProjectRestrictedAccessAlert'),
);

export default (props: { projectId: string }) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <ProjectRestrictedAccessAlert {...props} />
    </Providers>
  </Suspense>
);
