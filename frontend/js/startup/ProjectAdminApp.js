// @flow
import React, { lazy, Suspense } from 'react';
import Providers from './Providers';
import AlertBoxApp from '~/startup/AlertBoxApp';
import Loader from '~ui/FeedbacksIndicators/Loader';

const ProjectAdminPage = lazy(() =>
  import(/* webpackChunkName: "ProjectAdminPage" */ '~/components/Admin/Project/ProjectAdminPage'),
);

type ProjectAdminAppProps = {|
  +projectId: ?string,
  +firstCollectStepId: ?string,
|};

const ProjectAdminApp = ({ projectId, firstCollectStepId }: ProjectAdminAppProps) => (
  <Suspense fallback={<Loader />}>
    <Providers>
      <AlertBoxApp />
      <ProjectAdminPage projectId={projectId} firstCollectStepId={firstCollectStepId} />
    </Providers>
  </Suspense>
);

export default ProjectAdminApp;
