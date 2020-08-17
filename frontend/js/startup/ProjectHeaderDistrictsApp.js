// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import type { Uuid } from '~/types';
import Loader from '~ui/FeedbacksIndicators/Loader';

const ProjectHeaderDistricts = lazy(() => import('~/components/Project/ProjectHeaderDistricts'));

type Props = {
  projectId: Uuid,
};

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <ProjectHeaderDistricts {...props} />
    </Providers>
  </Suspense>
);
