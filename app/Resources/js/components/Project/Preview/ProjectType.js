// @flow
import React from 'react';
import { IntlMixin } from 'react-intl';
import classNames from 'classnames';

const ProjectType = React.createClass({
  propTypes: {
    project: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { project } = this.props;

    const divClasses = classNames({
      project__preview__type: true,
    });
    return (
      <div
        className={divClasses}
        style={{ backgroundColor: project.projectType.color }}>
        {this.getIntlMessage(project.projectType.title)}
      </div>
    );
  },
});

export default ProjectType;
