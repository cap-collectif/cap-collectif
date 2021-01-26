// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import type { Props } from '~/components/Project/ProjectTrashProposal';
import Loader from '~ui/FeedbacksIndicators/Loader';

const ProjectTrashProposal = lazy(() => import(/* webpackChunkName: "ProjectTrashProposal" */ '~/components/Project/ProjectTrashProposal'));

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <ProjectTrashProposal {...props} />
    </Providers>
  </Suspense>
);
