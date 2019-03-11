// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import ProjectPreviewCounter from './ProjectPreviewCounter';
import TagsList from '../../Ui/List/TagsList';
import InlineList from '../../Ui/List/InlineList';
import ProjectRestrictedAccessFragment from '../Page/ProjectRestrictedAccessFragment';
import type { ProjectPreviewCounters_project } from './__generated__/ProjectPreviewCounters_project.graphql';

type Props = {
  project: ProjectPreviewCounters_project,
};

export class ProjectPreviewCounters extends React.Component<Props> {
  getNbCounters = () => {
    const { project } = this.props;
    const { votes } = project;
    let nb = 2;
    nb += votes.totalCount ? 1 : 0;
    return nb;
  };

  render() {
    const { project } = this.props;

    return (
      <TagsList>
        <ProjectPreviewCounter
          value={project.contributionsCount ? project.contributionsCount : 0}
          label="project.preview.counters.contributions"
          showZero
          icon="cap-baloon-1"
        />
        <ProjectPreviewCounter
          value={project.votes.totalCount}
          label="project.preview.counters.votes"
          icon="cap-hand-like-2-1"
        />
        <ProjectPreviewCounter
          value={project.contributors.totalCount + project.contributors.anonymousCount}
          label="project.preview.counters.contributors"
          showZero
          icon="cap-user-2-1"
        />
        {project.districts && project.districts.length > 0 && (
          <div className="tags-list__tag">
            <i className="cap cap-marker-1-1" />
            <InlineList separator="," className="d-i">
              {project.districts &&
                project.districts.map((district, key) => (
                  <li key={key}>{district && district.name}</li>
                ))}
            </InlineList>
          </div>
        )}

        <div className="tags-list__tag">
          {/* $FlowFixMe */}
          <ProjectRestrictedAccessFragment project={project} icon="cap-lock-2-1" />
        </div>
      </TagsList>
    );
  }
}

export default createFragmentContainer(ProjectPreviewCounters, {
  project: graphql`
    fragment ProjectPreviewCounters_project on Project {
      id
      districts {
        name
      }
      contributors {
        totalCount
        anonymousCount
      }
      votes {
        totalCount
      }
      contributionsCount
      ...ProjectRestrictedAccessFragment_project
    }
  `,
});
