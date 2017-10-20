// @flow
import * as React from 'react';
import { Col } from 'react-bootstrap';
import ProjectType from './ProjectType';
import ProjectCover from './ProjectCover';
import ProjectPreviewBody from './ProjectPreviewBody';
import ProjectPreviewCounters from './ProjectPreviewCounters';

type Props = {
  project: Object,
  hasNotParticipativeSteps: boolean,
};

export class ProjectPreview extends React.Component<Props> {
  render() {
    const { project, hasNotParticipativeSteps } = this.props;

    return (
      <Col xs={12} sm={6} md={4} lg={3}>
        <div className="thumbnail  thumbnail--custom  block  block--bordered">
          {project.projectType && <ProjectType project={project} />}
          <ProjectCover project={project} />
          <ProjectPreviewBody project={project} />
          {project.hasParticipativeStep && <ProjectPreviewCounters project={project} />}
          {!hasNotParticipativeSteps &&
            !project.hasParticipativeStep && <div style={{ height: '55px' }}> </div>}
        </div>
      </Col>
    );
  }
}

export default ProjectPreview;
