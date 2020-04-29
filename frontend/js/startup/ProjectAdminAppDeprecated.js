// @flow
import React from 'react';
import Providers from './Providers';
import ProjectAdminPageDeprecated from '../components/Admin/Project/Deprecated/ProjectAdminPageDeprecated';

const ProjectAdminAppDeprecated = ({ projectId }: { projectId: ?string }) => (
  <Providers>
    <ProjectAdminPageDeprecated projectId={projectId} />
  </Providers>
);

export default ProjectAdminAppDeprecated;
