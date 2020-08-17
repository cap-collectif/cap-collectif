// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import type { Props } from '~/components/Project/ProjectTrash';
import Loader from '~ui/FeedbacksIndicators/Loader';

const ProjectTrash = lazy(() => import('~/components/Project/ProjectTrash'));

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <ProjectTrash {...props} />
    </Providers>
  </Suspense>
);
