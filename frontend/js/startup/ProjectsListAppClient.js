// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';

const ProjectsList = lazy(() => import('~/components/Project/List/ProjectsList'));

type Props = {|
  limit?: number,
  paginate?: boolean,
  themeId?: string,
  authorId?: string,
  onlyPublic?: boolean,
|};

export default (props: Props) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <ProjectsList {...props} />
    </Providers>
  </Suspense>
);
