// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import styled, { type StyledComponent } from 'styled-components';
import DefaultProjectImage from './DefaultProjectImage';
import type { ProjectImage_project } from '~relay/ProjectImage_project.graphql';

type Props = {|
  +project: ProjectImage_project,
|};

const Image: StyledComponent<{ archived: boolean }, {}, HTMLElement> = styled.img`
  filter: ${props => (props.archived ? 'grayscale(1)' : null)};
  opacity: ${props => (props.archived ? '50%' : null)};
`;

const DefaultProjectImageWrapper: StyledComponent<
  { archived: boolean },
  {},
  HTMLElement,
> = styled.div`
  filter: ${props => (props.archived ? 'grayscale(1)' : null)};
  opacity: ${props => (props.archived ? '50%' : null)};
`;

class ProjectImage extends React.Component<Props> {
  render() {
    const { project } = this.props;
    if (project.cover && project.cover.url) {
      return (
        <Image
          src={project.cover.url}
          alt={project.title}
          className="img-responsive"
          archived={project.archived}
        />
      );
    }
    return (
      <DefaultProjectImageWrapper archived={project.archived} className="bg--project">
        {!project.video ? <DefaultProjectImage /> : null}
      </DefaultProjectImageWrapper>
    );
  }
}

export default createFragmentContainer(ProjectImage, {
  project: graphql`
    fragment ProjectImage_project on Project {
      title
      video
      cover {
        url
      }
      archived
    }
  `,
});
