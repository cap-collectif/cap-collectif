// @flow
import * as React from 'react';
import ProjectPreview from '../Preview/ProjectPreview';

type Props = {
  projects: Array<Object>,
};

export class ProjectsList extends React.Component<Props> {
  hasNotParticipativeSteps() {
    const { projects } = this.props;

    const hasNotParticipativeSteps = projects.filter(
      project => project.hasParticipativeStep === false,
    );

    if (hasNotParticipativeSteps.length === projects.length) {
      return true;
    }

    return false;
  }

  render() {
    const { projects } = this.props;

    if (projects.length > 0) {
      return (
        <div className="project__preview">
          {projects.map((projectDetail, index) => {
            return (
              <ProjectPreview
                key={index}
                project={projectDetail}
                hasNotParticipativeSteps={this.hasNotParticipativeSteps()}
              />
            );
          })}
        </div>
      );
    }
    return <p>Aucun projet</p>;
  }
}

export default ProjectsList;
