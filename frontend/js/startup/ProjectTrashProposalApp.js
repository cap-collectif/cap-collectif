// @flow
import React from 'react';
import Providers from './Providers';
import ProjectTrashProposal, { type Props } from '../components/Project/ProjectTrashProposal';

export default (props: Props) => (
  <Providers>
    <ProjectTrashProposal {...props} />
  </Providers>
);
