// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import type { Props } from '~/components/Project/ProjectTrashComment';
import Loader from '~ui/FeedbacksIndicators/Loader';

const ProjectTrashComment = lazy(() => import('~/components/Project/ProjectTrashComment'));

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <ProjectTrashComment {...props} />
    </Providers>
  </Suspense>
);
