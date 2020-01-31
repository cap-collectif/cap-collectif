// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import ProjectPreviewCounter from './ProjectPreviewCounter';
import ProjectHeaderDistrictsList from '../ProjectHeaderDistrictsList';
import Tag from '../../Ui/Labels/Tag';
import TagsList from '../../Ui/List/TagsList';
import { getProjectLabelByType } from '~/utils/interpellationLabelHelper';
import ProjectRestrictedAccessFragment from '../Page/ProjectRestrictedAccessFragment';
import type { ProjectPreviewCounters_project } from '~relay/ProjectPreviewCounters_project.graphql';

type Props = {|
  +project: ProjectPreviewCounters_project,
|};

export class ProjectPreviewCounters extends React.Component<Props> {
  render() {
    const { project } = this.props;

    const showCounters = project.hasParticipativeStep && !project.isExternal;
    const contributionsLabel =
      project.type && project.type.title
        ? getProjectLabelByType(project.type.title, 'contributions')
        : '';
    const votesLabel =
      project.type && project.type.title ? getProjectLabelByType(project.type.title, 'votes') : '';

    return (
      <div className={project.isExternal ? '' : 'mt-10'}>
        <TagsList>
          {showCounters && project.isContributionsCounterDisplayable && (
            <ProjectPreviewCounter
              value={project.contributions.totalCount ? project.contributions.totalCount : 0}
              label={contributionsLabel}
              showZero
              icon="cap-baloon-1"
            />
          )}
          {showCounters && project.isVotesCounterDisplayable && (
            <ProjectPreviewCounter
              value={project.votes.totalCount}
              label={votesLabel}
              icon="cap-hand-like-2-1"
            />
          )}
          {showCounters && project.isParticipantsCounterDisplayable && (
            <ProjectPreviewCounter
              value={project.contributors.totalCount + project.contributors.anonymousCount}
              label="project.preview.counters.contributors"
              showZero
              icon="cap-user-2-1"
            />
          )}
          {project.districts && project.districts.totalCount > 0 && (
            <Tag icon="cap cap-marker-1-1">
              <ProjectHeaderDistrictsList fontSize={14} project={project} breakingNumber={1} />
            </Tag>
          )}
          <ProjectRestrictedAccessFragment project={project} icon="cap-lock-2-1" />
        </TagsList>
      </div>
    );
  }
}

export default createFragmentContainer(ProjectPreviewCounters, {
  project: graphql`
    fragment ProjectPreviewCounters_project on Project {
      id
      districts {
        totalCount
        edges {
          node {
            name
          }
        }
      }
      hasParticipativeStep
      isExternal
      ...ProjectHeaderDistrictsList_project
      isVotesCounterDisplayable
      isContributionsCounterDisplayable
      isParticipantsCounterDisplayable
      contributors {
        totalCount
        anonymousCount
      }
      votes {
        totalCount
      }
      contributions {
        totalCount
      }
      type {
        title
      }
      ...ProjectRestrictedAccessFragment_project
      ...ProjectType_project
    }
  `,
});
