// @flow
import React from 'react';
import Providers from './Providers';
import ProjectHeaderDistricts from '../components/Project/ProjectHeaderDistricts';
import type { Uuid } from '../types';

type Props = {
  projectId: Uuid,
};

export default (props: Props) => (
  <Providers>
    <ProjectHeaderDistricts {...props} />
  </Providers>
);
