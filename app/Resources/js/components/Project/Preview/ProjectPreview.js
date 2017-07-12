// @flow
import React from 'react';
import { Col } from 'react-bootstrap';
import ProjectType from './ProjectType';
import ProjectCover from './ProjectCover';
import ProjectPreviewBody from './ProjectPreviewBody';
import ProjectPreviewCounters from './ProjectPreviewCounters';

const ProjectPreview = React.createClass({
  propTypes: {
    project: React.PropTypes.object.isRequired,
  },

  render() {
    const { project } = this.props;
    return (
      <Col xs={12} sm={6} md={4} lg={3}>
        <div className="thumbnail  thumbnail--custom  block  block--bordered">
          {project.projectType && <ProjectType project={project} />}
          <ProjectCover project={project} />
          <ProjectPreviewBody project={project} />
          <ProjectPreviewCounters project={project} />
        </div>
      </Col>
    );
  },
});

export default ProjectPreview;
