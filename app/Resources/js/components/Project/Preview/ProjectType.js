// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';

const ProjectType = React.createClass({
  propTypes: {
    project: React.PropTypes.object.isRequired,
  },

  render() {
    const { project } = this.props;

    const divClasses = classNames({
      project__preview__type: true,
    });
    return (
      <div className={divClasses} style={{ backgroundColor: project.projectType.color }}>
        <FormattedMessage id={project.projectType.title} />
      </div>
    );
  },
});

export default ProjectType;
