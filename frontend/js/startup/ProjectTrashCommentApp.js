// @flow
import React from 'react';
import Providers from './Providers';
import ProjectTrashComment, { type Props } from '../components/Project/ProjectTrashComment';

export default (props: Props) => (
  <Providers>
    <ProjectTrashComment {...props} />
  </Providers>
);
