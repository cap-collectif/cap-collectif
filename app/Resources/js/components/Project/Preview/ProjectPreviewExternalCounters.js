// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import ProjectPreviewCounter from './ProjectPreviewCounter';
import TagsList from '../../Ui/List/TagsList';
import ProjectRestrictedAccessFragment from '../Page/ProjectRestrictedAccessFragment';
import type { ProjectPreviewExternalCounters_project } from '~relay/ProjectPreviewExternalCounters_project.graphql';

type Props = {
  project: ProjectPreviewExternalCounters_project,
};

export class ProjectPreviewExternalCounters extends React.Component<Props> {
  render() {
    const { project } = this.props;

    return (
      <TagsList>
        {project.contributionsCount > 0 && (
          <ProjectPreviewCounter
            value={project.contributionsCount}
            label="project.preview.counters.contributions"
            icon="cap-baloon-1"
          />
        )}
        {project.votes && project.votes.totalCount > 0 && (
          <ProjectPreviewCounter
            value={project.votes.totalCount}
            label="project.preview.counters.votes"
            icon="cap-hand-like-2-1"
          />
        )}
        {project.contributors && project.contributors.totalCount > 0 && (
          <ProjectPreviewCounter
            value={project.contributors.totalCount}
            label="project.preview.counters.contributors"
            icon="cap-user-2-1"
          />
        )}

        {/* $FlowFixMe */}
        <ProjectRestrictedAccessFragment project={project} icon="cap-lock-2-1" />
      </TagsList>
    );
  }
}

export default createFragmentContainer(ProjectPreviewExternalCounters, {
  project: graphql`
    fragment ProjectPreviewExternalCounters_project on Project {
      id
      contributors {
        totalCount
      }
      votes {
        totalCount
      }
      contributionsCount
      ...ProjectRestrictedAccessFragment_project
    }
  `,
});
