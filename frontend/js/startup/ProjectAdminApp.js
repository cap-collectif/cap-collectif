// @flow
import React from 'react';
import Providers from './Providers';
import ProjectAdminPage from '../components/Admin/Project/ProjectAdminPage';
import AlertBoxApp from '~/startup/AlertBoxApp';

type ProjectAdminAppProps = {|
  +projectId: ?string,
  +firstCollectStepId: ?string,
|};

const ProjectAdminApp = ({ projectId, firstCollectStepId }: ProjectAdminAppProps) => (
  <Providers>
    <AlertBoxApp />
    <ProjectAdminPage projectId={projectId} firstCollectStepId={firstCollectStepId} />
  </Providers>
);

export default ProjectAdminApp;
