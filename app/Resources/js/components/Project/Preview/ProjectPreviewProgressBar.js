// @flow
import * as React from 'react';
import { ProgressBar } from 'react-bootstrap';
// import { FormattedMessage } from 'react-intl';

// import ProjectPreviewProgressBarItem from './ProjectPreviewProgressBarItem';

type Props = {
  project: Object,
  actualStep: Object,
};

export class ProjectPreviewProgressBar extends React.Component<Props> {
  getStyle = (stepStatus: string) => {
    if (stepStatus === 'open') {
      return 'success';
    }
  };

  getClass = (stepStatus: string) => {
    if (stepStatus === 'future') {
      return 'progress_future-step';
    } else if (stepStatus === 'closed') {
      return 'progress_closed-step';
    }
  };

  getLabel = (stepStatus: string) => {
    if (stepStatus === 'open') {
      return 'En cours';
    } else if (stepStatus === 'future') {
      return 'À venir';
    } else if (stepStatus === 'closed') {
      return 'Terminé';
    }
    return '';
  };

  getWidth = (stepStatus: string) => {
    if (stepStatus === 'open') {
      return 50;
    } else if (stepStatus === 'closed' || stepStatus === 'future') {
      return 100;
    }
    return 0;
  };

  render() {
    const { project, actualStep } = this.props;
    const nbSteps = project.steps.length;

    if (nbSteps > 0) {
      return (
        <div className="thumbnail__steps-bar">
          <ProgressBar
            className={this.getClass(actualStep.status)}
            bsStyle={this.getStyle(actualStep.status)}
            now={this.getWidth(actualStep.status)}
            label={this.getLabel(actualStep.status)}
          />
        </div>
      );
    }
    return null;
  }
}

export default ProjectPreviewProgressBar;
