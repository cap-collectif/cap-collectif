// @flow
import * as React from 'react';
import { Col } from 'react-bootstrap';
import ProjectType from './ProjectType';
import ProjectCover from './ProjectCover';
import ProjectPreviewBody from './ProjectPreviewBody';

type Props = {
  project: Object,
};

export class ProjectPreview extends React.Component<Props> {
  render() {
    const { project } = this.props;

    return (
      <Col xs={12} sm={6} md={4} lg={3}>
        <div className="thumbnail  thumbnail--custom  block  block--bordered">
          {project.projectType && <ProjectType project={project} />}
          <ProjectCover project={project} />
          <ProjectPreviewBody project={project} />
        </div>
      </Col>
    );
  }
}

export default ProjectPreview;
