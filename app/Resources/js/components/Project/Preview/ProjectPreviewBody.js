import React from 'react';
import { IntlMixin } from 'react-intl';
import ProjectPreviewThemes from './ProjectPreviewThemes';
import ProjectPreviewProgressBar from './ProjectPreviewProgressBar';

const ProjectPreviewBody = React.createClass({
  propTypes: {
    project: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { project } = this.props;
    return (
      <div className="box project__preview__body">
        <div>
          <ProjectPreviewThemes project={project} />
          <h2 className="h4 project__preview__title">
            <a href={project._links.show}>
              {project.title}
            </a>
          </h2>
        </div>
        <ProjectPreviewProgressBar project={project} />
      </div>
    );
  },

});

export default ProjectPreviewBody;
