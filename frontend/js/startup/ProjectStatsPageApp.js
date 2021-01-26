// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import type { OwnProps as Props } from '~/components/Project/Stats/ProjectStatsPage';
import Loader from '~ui/FeedbacksIndicators/Loader';

const ProjectStatsPage = lazy(() => import(/* webpackChunkName: "ProjectStatsPage" */ '~/components/Project/Stats/ProjectStatsPage'));

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <ProjectStatsPage {...props} />
    </Providers>
  </Suspense>
);
