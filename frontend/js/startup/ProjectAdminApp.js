// @flow
import React from 'react';
import Providers from './Providers';
import ProjectAdminPage from '../components/Admin/Project/ProjectAdminPage';
import { ProjectAdminProposalsProvider } from '~/components/Admin/Project/ProjectAdminPage.context';
import AlertBoxApp from '~/startup/AlertBoxApp';

type ProjectAdminAppProps = {|
  +projectId: ?string,
  +firstCollectStepId: ?string,
|};

const ProjectAdminApp = ({ projectId, firstCollectStepId }: ProjectAdminAppProps) => (
  <Providers>
    <ProjectAdminProposalsProvider firstCollectStepId={firstCollectStepId}>
      <AlertBoxApp />
      <ProjectAdminPage projectId={projectId} />
    </ProjectAdminProposalsProvider>
  </Providers>
);

export default ProjectAdminApp;
