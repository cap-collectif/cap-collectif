// @flow
import * as React from 'react';
import DefaultProjectImage from './DefaultProjectImage';

type Props = {
  project: Object,
};

class ProjectImage extends React.Component<Props> {
  render() {
    const { project } = this.props;
    if (project.cover) {
      return <img src={project.cover.url} alt={project.title} className="img-responsive" />;
    }
    return (
      <div className="bg--default bg--project">
        {!project.video ? <DefaultProjectImage /> : null}
      </div>
    );
  }
}

export default ProjectImage;
