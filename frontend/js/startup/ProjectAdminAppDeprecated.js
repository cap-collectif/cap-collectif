// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import Loader from '~ui/FeedbacksIndicators/Loader';

const ProjectAdminPageDeprecated = lazy(() =>
  import(/* webpackChunkName: "ProjectAdminPageDeprecated" */ '~/components/Admin/Project/Deprecated/ProjectAdminPageDeprecated'),
);

const ProjectAdminAppDeprecated = ({ projectId }: { projectId: ?string }) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <ProjectAdminPageDeprecated projectId={projectId} />
    </Providers>
  </Suspense>
);

export default ProjectAdminAppDeprecated;
