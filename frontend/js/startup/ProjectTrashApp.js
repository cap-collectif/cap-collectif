// @flow
import React from 'react';
import Providers from './Providers';
import ProjectTrash, { type Props } from '../components/Project/ProjectTrash';

export default (props: Props) => (
  <Providers>
    <ProjectTrash {...props} />
  </Providers>
);
