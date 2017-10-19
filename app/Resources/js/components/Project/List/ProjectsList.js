// @flow
import React, { PropTypes } from 'react';
import { Row } from 'react-bootstrap';
import ProjectPreview from '../Preview/ProjectPreview';

const ProjectsList = React.createClass({
  propTypes: {
    projects: PropTypes.array.isRequired,
  },

  hasNotParticipativeSteps() {
    const { projects } = this.props;

    const hasNotParticipativeSteps = projects.filter(
      project => project.hasParticipativeStep === false,
    );

    if (hasNotParticipativeSteps.length === projects.length) {
      return true;
    }

    return false;
  },

  render() {
    const { projects } = this.props;

    console.log(this.hasNotParticipativeSteps());

    if (projects.length > 0) {
      return (
        <Row className="project__preview">
          {projects.map((projectDetail, index) => {
            return (
              <ProjectPreview
                key={index}
                project={projectDetail}
                hasNotParticipativeSteps={this.hasNotParticipativeSteps()}
              />
            );
          })}
        </Row>
      );
    }
    return <p>Aucun projet</p>;
  },
});

export default ProjectsList;
