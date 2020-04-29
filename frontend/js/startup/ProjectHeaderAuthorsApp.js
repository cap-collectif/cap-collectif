// @flow
import React from 'react';
import Providers from './Providers';
import ProjectHeaderAuthorsView, {
  type Props,
} from '../components/Project/Authors/ProjectHeaderAuthorsView';

export default (props: Props) => (
  <Providers>
    <ProjectHeaderAuthorsView {...props} />
  </Providers>
);
