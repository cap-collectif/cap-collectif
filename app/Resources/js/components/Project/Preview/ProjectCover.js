// @flow
import * as React from 'react';
import classNames from 'classnames';
import ProjectImage from './ProjectImage';
import CardCover from '../../Ui/Card/CardCover';

const ProjectCover = React.createClass({
  propTypes: {
    project: React.PropTypes.object.isRequired,
  },

  render() {
    const { project } = this.props;
    const link = project._links.external || project._links.show;
    const linkClasses = classNames({
      bg__wrapper: !project.cover,
    });

    return (
      <CardCover>
        <a href={link} alt={project.title} className={linkClasses}>
          <ProjectImage project={project} />
        </a>
      </CardCover>
    );
  },
});

export default ProjectCover;
