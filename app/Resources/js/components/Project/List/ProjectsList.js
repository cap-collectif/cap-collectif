import React from 'react';
import { IntlMixin } from 'react-intl';
import { Row } from 'react-bootstrap';
import ProjectPreview from '../Preview/ProjectPreview';

const ProjectsList = React.createClass({
  propTypes: {
    projects: React.PropTypes.array.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { projects } = this.props;
    if (projects.length > 0) {
      return (
        <Row>
          {
            projects.map((project, index) => {
              return <ProjectPreview key={index} project={project}/>;
            })
          }
        </Row>
      );
    }
  },

});

export default ProjectsList;
