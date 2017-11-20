// @flow
import * as React from 'react';
import ProjectPreview from '../Preview/ProjectPreview';

type Props = {
  projects: Array<Object>,
};

export class ProjectsList extends React.Component<Props> {
  // hasNotParticipativeSteps() {
  //   const { projects } = this.props;
  //
  //   const hasNotParticipativeSteps = projects.filter(
  //     project => project.hasParticipativeStep === false,
  //   );
  //
  //   if (hasNotParticipativeSteps.length === projects.length) {
  //     return true;
  //   }
  //
  //   return false;
  // }

  // testHasNotParticipativeSteps() {
  //   const { projects } = this.props;
  //
  //   const testHasNotParticipativeSteps = projects.filter(
  //     project => project.hasParticipativeStep === false,
  //   );
  //
  //   return testHasNotParticipativeSteps;
  // }

  render() {
    const { projects } = this.props;

    // console.warn(this.testHasNotParticipativeSteps())

    if (projects.length > 0) {
      return (
        <div className="project__preview">
          {projects.map((projectDetail, index) => {
            return (
              <ProjectPreview
                key={index}
                project={projectDetail}
              />
            );
          })}
        </div>
      );
    }
    return <p>Aucun projet </p>;
  }
}

export default ProjectsList;
