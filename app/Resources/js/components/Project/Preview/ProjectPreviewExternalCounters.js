// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import styled, { type StyledComponent } from 'styled-components';
import ProjectPreviewCounter from './ProjectPreviewCounter';
import TagsList from '../../Ui/List/TagsList';
import ProjectRestrictedAccessFragment from '../Page/ProjectRestrictedAccessFragment';
import type { ProjectPreviewExternalCounters_project } from '~relay/ProjectPreviewExternalCounters_project.graphql';
import colors from '../../../utils/colors';
import Icon from '~ui/Icons/Icon';
import { getExternalExposedLink } from '~/utils/externalExposedLink';

type Props = {|
  +project: ProjectPreviewExternalCounters_project,
|};

export const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  .link-gray {
    color: ${colors.darkGray};
    font-size: 16px;
  }
`;

export class ProjectPreviewExternalCounters extends React.Component<Props> {
  render() {
    const { project } = this.props;
    return (
      <>
        <Container className="mb-15">
          <Icon name="link" size={13} />
          <span className="link-gray ml-5">
            {project && project.externalLink ? getExternalExposedLink(project.externalLink) : ''}
          </span>
        </Container>
        <TagsList>
          {project.externalContributionsCount !== null &&
            project.externalContributionsCount !== undefined && (
              <ProjectPreviewCounter
                showZero
                value={project.externalContributionsCount}
                label="project.preview.counters.contributions"
                icon="cap-baloon-1"
              />
            )}
          {project.externalVotesCount !== null && project.externalVotesCount !== undefined && (
            <ProjectPreviewCounter
              showZero
              value={project.externalVotesCount}
              label="project.preview.counters.votes"
              icon="cap-hand-like-2-1"
            />
          )}
          {project.externalParticipantsCount !== null &&
            project.externalParticipantsCount !== undefined && (
              <ProjectPreviewCounter
                showZero
                value={project.externalParticipantsCount}
                label="project.preview.counters.contributors"
                icon="cap-user-2-1"
              />
            )}

          <ProjectRestrictedAccessFragment project={project} icon="cap-lock-2-1" />
        </TagsList>
      </>
    );
  }
}

export default createFragmentContainer(ProjectPreviewExternalCounters, {
  project: graphql`
    fragment ProjectPreviewExternalCounters_project on Project {
      id
      externalLink
      externalParticipantsCount
      externalContributionsCount
      externalVotesCount
      ...ProjectRestrictedAccessFragment_project
    }
  `,
});
