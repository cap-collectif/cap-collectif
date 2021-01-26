// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import { type Props } from '~/components/Project/ProjectTrashButton';
import Loader from '~ui/FeedbacksIndicators/Loader';

const ProjectTrashButton = lazy(() => import(/* webpackChunkName: "ProjectTrashButton" */ '~/components/Project/ProjectTrashButton'));

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <ProjectTrashButton {...props} />
    </Providers>
  </Suspense>
);
