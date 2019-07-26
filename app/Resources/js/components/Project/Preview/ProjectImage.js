// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import DefaultProjectImage from './DefaultProjectImage';
import type { ProjectImage_project } from '~relay/ProjectImage_project.graphql';

type Props = {|
  +project: ProjectImage_project,
|};

class ProjectImage extends React.Component<Props> {
  render() {
    const { project } = this.props;
    if (project.cover && project.cover.url) {
      return <img src={project.cover.url} alt={project.title} className="img-responsive" />;
    }
    return <div className="bg--project">{!project.video ? <DefaultProjectImage /> : null}</div>;
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
    }
  `,
});
