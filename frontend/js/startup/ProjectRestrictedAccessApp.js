// @flow
import React from 'react';
import Providers from './Providers';
import ProjectRestrictedAccess from '../components/Project/Page/ProjectRestrictedAccess';

export default (props: { projectId: string }) => (
  <Providers>
    <ProjectRestrictedAccess {...props} />
  </Providers>
);
