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
    const isExternalLink = project.external !== null;
    const link = isExternalLink ? project._links.external : project._links.show;
    const linkClasses = classNames({
      bg__wrapper: !project.cover,
    });
    const divClasses = classNames({
      project__preview__cover: true,
    });
    return (
      <div className={divClasses}>
        <a href={link} alt={project.title} className={linkClasses}>
          <ProjectImage project={project} />
          {
            isExternalLink && <img src="svg/external_link.svg" alt="External link" />
          }
        </a>
      </div>
    );
  },

});

export default ProjectCover;
