// @flow
import * as React from 'react';
import { ProgressBar } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { Progress } from '../../Ui/FeedbacksIndicators/Progress';

type Props = {
  project: Object,
  actualStep: Object,
  isCurrentStep?: ?boolean,
};

export class ProjectPreviewProgressBar extends React.Component<Props> {
  getStyle = (stepStatus: string) => {
    const { isCurrentStep } = this.props;

    if (stepStatus === 'OPENED' || isCurrentStep) {
      return 'success';
    }
  };

  getClass = (stepStatus: string) => {
    const { isCurrentStep } = this.props;

    if (stepStatus === 'FUTURE') {
      return 'progress-bar_empty';
    }
    if (stepStatus === 'CLOSED' && !isCurrentStep) {
      return 'progress-bar_grey';
    }
  };

  getLabel = (step: Object) => {
    const { isCurrentStep } = this.props;

    if (step.timeless === true) {
      return <FormattedMessage id="step.timeless" />;
    }
    if (step.status === 'OPENED' || isCurrentStep) {
      return <FormattedMessage id="step.status.open" />;
    }
    if (step.status === 'FUTURE') {
      return <FormattedMessage id="step.status.future" />;
    }
    if (step.status === 'CLOSED' && !isCurrentStep) {
      return <FormattedMessage id="step.status.closed" />;
    }
  };

  getWidth = (step: Object) => {
    const { isCurrentStep } = this.props;

    if (
      (step.status === 'CLOSED' && !isCurrentStep) ||
      step.status === 'FUTURE' ||
      step.timeless === true
    ) {
      return 100;
    }
    if (step.status === 'OPENED' || isCurrentStep) {
      return 50;
    }

    return 0;
  };

  render() {
    const { project, actualStep } = this.props;
    const nbSteps = project.steps.length;

    if (nbSteps > 0) {
      return (
        <Progress>
          <ProgressBar
            className={this.getClass(actualStep.status)}
            bsStyle={this.getStyle(actualStep.status)}
            now={this.getWidth(actualStep)}
            label={this.getLabel(actualStep)}
          />
        </Progress>
      );
    }
    return null;
  }
}

export default ProjectPreviewProgressBar;
