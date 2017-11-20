// @flow
import * as React from 'react';
import { ProgressBar } from 'react-bootstrap';
// import { FormattedMessage } from 'react-intl';

// import ProjectPreviewProgressBarItem from './ProjectPreviewProgressBarItem';

type Props = {
  project: Object,
};

export class ProjectPreviewProgressBar extends React.Component<Props> {

  // getCompletedStepsNb() {
  //   const { project } = this.props;
  //   const completedSteps = project.steps.filter(step => {
  //     return step.status === 'closed';
  //   });
  //   return completedSteps.length;
  // }
  //
  // getCompletedStepsPercentage() {
  //   const { project } = this.props;
  //   const completedStepsNb = this.getCompletedStepsNb();
  //   const total = project.steps.length;
  //   const percentage = completedStepsNb > 0 && total > 0 ? completedStepsNb / total * 100 : 0;
  //   return Math.round(percentage);
  // }

  getActualStep() {
    const { project } = this.props;
    const dateNow = new Date();
    const projectStep = project.steps.sort((a, b) => a.position - b.position);

    const stepClosed = projectStep.filter(step => (step.status === 'closed'));
    const stepFuture = projectStep.filter(step => (step.status === 'future'));


  }

  getClasses(stepStatus) {
    if(stepStatus === 'closed') {
      return 'info'
    }

    return 'success'
  };

  getLabel(stepStatus) {
    if(stepStatus === 'open') {
      return 'en cours'
    } else if(stepStatus === 'future') {
      return 'à venir'
    } else if(stepStatus === 'closed') {
      return 'terminé'
    }
    return '';
  };

  render() {
    const { project } = this.props;
    const nbSteps = project.steps.length;

    console.log(this.getActualStep());
    // console.log(project.steps);

    if (nbSteps > 0) {
      const width = 100 / nbSteps;
      return (
        <div className="thumbnail__steps-bar">
          <ProgressBar>
            {project.steps.sort((a, b) => a.position - b.position).map((step, index) => {
              return (
                <ProgressBar bsStyle={this.getClasses(step.status)} now={width} key={index} label={this.getLabel(step.status)} />
              );
            })}
          </ProgressBar>
        </div>
      );
    }
    return null;
  }
}

export default ProjectPreviewProgressBar;
