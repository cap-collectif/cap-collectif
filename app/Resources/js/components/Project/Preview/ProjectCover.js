import React from 'react';
import { IntlMixin } from 'react-intl';
import classNames from 'classnames';
import ProjectImage from './ProjectImage';

const ProjectCover = React.createClass({
  propTypes: {
    project: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { project } = this.props;
    const linkClasses = classNames({
      bg__wrapper: !project.cover,
    });
    const divClasses = classNames({
      play: !!project.video,
      project__preview__cover: true,
    });
    return (
      <div className={divClasses}>
        <a href={project._links.show} alt={project.title} className={linkClasses}>
          <ProjectImage project={project} />
        </a>
      </div>
    );
  },

});

export default ProjectCover;
