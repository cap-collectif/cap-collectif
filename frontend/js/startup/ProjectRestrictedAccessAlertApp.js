// @flow
import React from 'react';
import Providers from './Providers';
import ProjectRestrictedAccessAlert from '../components/Project/Page/ProjectRestrictedAccessAlert';

export default (props: { projectId: string }) => (
  <Providers>
    <ProjectRestrictedAccessAlert {...props} />
  </Providers>
);
