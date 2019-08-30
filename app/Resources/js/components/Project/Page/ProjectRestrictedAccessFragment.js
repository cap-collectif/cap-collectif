// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import RenderCustomAccess from './RenderCustomAccess';
import RenderPrivateAccess from './RenderPrivateAccess';
import type { ProjectRestrictedAccessFragment_project } from '~relay/ProjectRestrictedAccessFragment_project.graphql';

type Props = {
  icon?: ?string,
  project: ProjectRestrictedAccessFragment_project,
};

class ProjectRestrictedAccessFragment extends React.Component<Props> {
  render() {
    const { project, icon } = this.props;
    if (project && project.visibility) {
      if (project.visibility === 'CUSTOM') {
        return (
          <div id="restricted-access">
            <React.Fragment>
              <RenderCustomAccess project={project} lockIcon={icon} />
            </React.Fragment>
          </div>
        );
      }
      if (project.visibility === 'ME' || project.visibility === 'ADMIN') {
        return (
          <div id="restricted-access">
            <React.Fragment>
              <RenderPrivateAccess project={project} lockIcon={icon} />
            </React.Fragment>
          </div>
        );
      }
    }
    return null;
  }
}

export default createFragmentContainer(ProjectRestrictedAccessFragment, {
  project: graphql`
    fragment ProjectRestrictedAccessFragment_project on Project {
      visibility
      ...RenderCustomAccess_project
      ...RenderPrivateAccess_project
    }
  `,
});
