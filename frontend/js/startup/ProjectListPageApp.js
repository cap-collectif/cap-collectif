// @flow
import React from 'react';
import Providers from './Providers';
import ProjectsListPage from '../components/Project/Page/ProjectListPage';
import type { Props } from '../components/Project/Page/ProjectListPage';

export default (props: Props) => (
  <Providers>
    <ProjectsListPage {...props} />
  </Providers>
);
