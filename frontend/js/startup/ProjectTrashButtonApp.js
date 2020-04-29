// @flow
import React from 'react';
import Providers from './Providers';
import ProjectTrashButton, { type Props } from '../components/Project/ProjectTrashButton';

export default (props: Props) => (
  <Providers>
    <ProjectTrashButton {...props} />
  </Providers>
);
