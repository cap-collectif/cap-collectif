// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay';

import { UserAvatarList } from '../../User/UserAvatarList';
import type { ProjectHeaderAuthors_project } from '~relay/ProjectHeaderAuthors_project.graphql';

type Props = {
  project: ProjectHeaderAuthors_project,
};

export const ProjectHeaderAuthors = (props: Props) => {
  const { project } = props;

  return (
    <div>
      {/* $FlowFixMe TODO */}
      <UserAvatarList users={project && project.authors ? project.authors : []} />
      <FormattedMessage
        id="project-authors"
        values={{
          authorName:
            /* $FlowFixMe TODO */
            project && project.authors && project.authors[0] ? project.authors[0].username : '',
          number: project && project.authors ? project.authors.length : 0,
        }}
      />
    </div>
  );
};

export default createFragmentContainer(ProjectHeaderAuthors, {
  project: graphql`
    fragment ProjectHeaderAuthors_project on Project {
      id
      authors {
        ...UserAvatarList_users
      }
    }
  `,
});
