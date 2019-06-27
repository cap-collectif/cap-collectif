// @flow
import * as React from 'react';

import { UserAvatarList } from '../../User/UserAvatarList';

type Props = {
  project: any,
};

export const ProjectHeaderAuthors = (props: Props) => {
  const { project } = props;

  return <UserAvatarList users={project.authors} />;
};

export default ProjectHeaderAuthors;
