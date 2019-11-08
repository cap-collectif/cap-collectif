// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import styled from 'styled-components';
import ProjectPreviewCounter from './ProjectPreviewCounter';
import TagsList from '../../Ui/List/TagsList';
import ProjectRestrictedAccessFragment from '../Page/ProjectRestrictedAccessFragment';
import type { ProjectPreviewExternalCounters_project } from '~relay/ProjectPreviewExternalCounters_project.graphql';
import colors from '../../../utils/colors';
import Icon from '~ui/Icons/Icon';

type Props = {|
  +project: ProjectPreviewExternalCounters_project,
|};

export const Container = styled.div`
  a {
    color: ${colors.darkGray};
  }
  font-size: 16px;
`;

export class ProjectPreviewExternalCounters extends React.Component<Props> {
  render() {
    const { project } = this.props;

    return (
      <>
        <Container className="mb-15">
          <Icon name="link" size={14} />
          <a href={project.externalLink}>{project.externalLink}</a>
        </Container>
        <TagsList>
          {project.contributionsCount >= 0 && (
            <ProjectPreviewCounter
              showZero
              value={project.contributionsCount}
              label="project.preview.counters.contributions"
              icon="cap-baloon-1"
            />
          )}
          {project.votes && (
            <ProjectPreviewCounter
              showZero
              value={project.votes.totalCount}
              label="project.preview.counters.votes"
              icon="cap-hand-like-2-1"
            />
          )}
          {project.contributors && (
            <ProjectPreviewCounter
              showZero
              value={project.contributors.totalCount}
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
