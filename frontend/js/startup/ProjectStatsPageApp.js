// @flow
import React from 'react';
import Providers from './Providers';
import ProjectStatsPage, {
  type OwnProps as Props,
} from '../components/Project/Stats/ProjectStatsPage';

export default (props: Props) => (
  <Providers>
    <ProjectStatsPage {...props} />
  </Providers>
);
