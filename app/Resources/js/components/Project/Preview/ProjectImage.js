// @flow
import React from 'react';
import { IntlMixin } from 'react-intl';
import DefaultProjectImage from './DefaultProjectImage';

const ProjectImage = React.createClass({
  propTypes: {
    project: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { project } = this.props;
    if (project.cover) {
      return <img src={project.cover.url} alt="" className="img-responsive" />;
    }
    return (
      <div className="bg--default bg--project">
        {!project.video ? <DefaultProjectImage /> : null}
      </div>
    );
  },
});

export default ProjectImage;
