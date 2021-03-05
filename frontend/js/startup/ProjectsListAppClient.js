// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';

const ProjectsList = lazy(() =>
  import(/* webpackChunkName: "ProjectsList" */ '~/components/Project/List/ProjectsList'),
);

type Props = {|
  limit?: number,
  paginate?: boolean,
  themeId?: string,
  authorId?: string,
  onlyPublic?: boolean,
|};

export default (props: Props) => (
  <Suspense fallback={null}>
    <Providers>
      <ProjectsList {...props} />
    </Providers>
  </Suspense>
);
