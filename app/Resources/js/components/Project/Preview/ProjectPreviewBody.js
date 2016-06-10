import React from 'react';
import { IntlMixin } from 'react-intl';
import ProjectPreviewThemes from './ProjectPreviewThemes';
import ProjectPreviewProgressBar from './ProjectPreviewProgressBar';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

const ProjectPreviewBody = React.createClass({
  propTypes: {
    project: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { project } = this.props;
    const tooltip = <Tooltip id={'project-' + project.id + '-tooltip'} >{project.title}</Tooltip>;
    return (
      <div className="box project__preview__body">
        <div>
          <ProjectPreviewThemes project={project} />
            <h2 className="h4 project__preview__title smart-fade">
              <OverlayTrigger placement="top" overlay={tooltip}>
                <a href={project._links.show}>
                  {project.title}
                </a>
              </OverlayTrigger>
            </h2>
        </div>
        <ProjectPreviewProgressBar project={project} />
      </div>
    );
  },

});

export default ProjectPreviewBody;
