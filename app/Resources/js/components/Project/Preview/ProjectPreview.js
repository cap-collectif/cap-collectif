import React from 'react';
import { IntlMixin } from 'react-intl';
import { Col } from 'react-bootstrap';
import ProjectCover from './ProjectCover';
import ProjectPreviewBody from './ProjectPreviewBody';
import ProjectPreviewCounters from './ProjectPreviewCounters';

const ProjectPreview = React.createClass({
  propTypes: {
    project: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { project } = this.props;
    return (
      <Col xs={12} sm={6} md={4} lg={3}>
        <div className="thumbnail  thumbnail--custom  block  block--bordered">
          <ProjectCover project={project} />
          <ProjectPreviewBody project={project} />
          <ProjectPreviewCounters project={project} />
        </div>
      </Col>
    );
  },

});

export default ProjectPreview;
