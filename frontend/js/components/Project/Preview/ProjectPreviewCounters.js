// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import ProjectPreviewCounter from './ProjectPreviewCounter';
import ProjectHeaderDistrictsList from '../ProjectHeaderDistrictsList';
import TagsList from '../../Ui/List/TagsList';
import ProjectRestrictedAccessFragment from '../Page/ProjectRestrictedAccessFragment';
import type { ProjectPreviewCounters_project } from '~relay/ProjectPreviewCounters_project.graphql';

type Props = {|
  +project: ProjectPreviewCounters_project,
|};

export class ProjectPreviewCounters extends React.Component<Props> {
  render() {
    const { project } = this.props;
    const showCounters = project.hasParticipativeStep && !project.isExternal;
    const projectType =
      project.type && project.type.title === 'project.types.interpellation'
        ? project.type.title
        : false;
    const contributionsLabel = projectType
      ? 'project.preview.counters.interpellations'
      : 'project.preview.counters.contributions';
    const votesLabel = projectType
      ? 'project.preview.counters.supports'
      : 'project.preview.counters.votes';

    return (
      <div className={project.isExternal ? '' : 'mt-10'}>
        <TagsList>
          {showCounters && project.isContributionsCounterDisplayable && (
            <ProjectPreviewCounter
              value={project.contributions.totalCount ? project.contributions.totalCount : 0}
              label={contributionsLabel}
              showZero
              icon="cap-baloon-1"
              archived={project.archived}
            />
          )}
          {showCounters && project.isVotesCounterDisplayable && (
            <ProjectPreviewCounter
              value={project.votes.totalCount}
              label={votesLabel}
              icon="cap-hand-like-2-1"
              archived={project.archived}
            />
          )}
          {showCounters && project.isParticipantsCounterDisplayable && (
            <ProjectPreviewCounter
              value={
                project.contributors.totalCount +
                project.anonymousVotes.totalCount +
                project.anonymousReplies.totalCount
              }
              label="project.preview.counters.contributors"
              showZero
              icon="cap-user-2-1"
              archived={project.archived}
            />
          )}
          {project.districts && project.districts.totalCount > 0 && (
            <ProjectHeaderDistrictsList project={project} breakingNumber={1} />
          )}
          <ProjectRestrictedAccessFragment project={project} icon="cap-lock-2-1" isOnProjectCard />
        </TagsList>
      </div>
    );
  }
}

export default createFragmentContainer(ProjectPreviewCounters, {
  project: graphql`
    fragment ProjectPreviewCounters_project on Project {
      id
      archived
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
      }
      votes {
        totalCount
      }
      anonymousVotes: votes(anonymous: true) {
        totalCount
      }
      contributions {
        totalCount
      }
      anonymousReplies: contributions(type: REPLY_ANONYMOUS) {
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
