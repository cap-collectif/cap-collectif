// @flow
import React from 'react';
import Providers from './Providers';
import ProjectsList from '../components/Project/List/ProjectsList';

type Props = {|
  limit?: number,
  paginate?: boolean,
  themeId?: string,
  authorId?: string,
  onlyPublic?: boolean,
|};

export default (props: Props) => (
  <Providers>
    <ProjectsList {...props} />
  </Providers>
);
