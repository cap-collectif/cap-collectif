// @flow
import React, { PropTypes } from 'react';
import { Row } from 'react-bootstrap';
import ProjectPreview from '../Preview/ProjectPreview';

const ProjectsList = React.createClass({
  propTypes: {
    projects: PropTypes.array.isRequired,
  },

  render() {
    const { projects } = this.props;

    if (projects.length > 0) {
      return (
        <Row>
          {projects.map((projectDetail, index) => {
            return <ProjectPreview key={index} project={projectDetail} />;
          })}
        </Row>
      );
    }
    return <p>Aucun projet</p>;
  },
});

export default ProjectsList;
