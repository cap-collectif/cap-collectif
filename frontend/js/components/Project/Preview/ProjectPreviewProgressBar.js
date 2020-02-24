// @flow
import * as React from 'react';
import { ProgressBar } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Progress } from '../../Ui/FeedbacksIndicators/Progress';
import type { ProjectPreviewProgressBar_project } from '~relay/ProjectPreviewProgressBar_project.graphql';
import type {
  StepState,
  ProjectPreviewProgressBar_actualStep,
} from '~relay/ProjectPreviewProgressBar_actualStep.graphql';

type Props = {|
  +project: ProjectPreviewProgressBar_project,
  +actualStep: ProjectPreviewProgressBar_actualStep,
  +isCurrentStep?: ?boolean,
|};

export class ProjectPreviewProgressBar extends React.Component<Props> {
  getStyle = (state: StepState) => {
    const { isCurrentStep } = this.props;

    if (state === 'OPENED' || isCurrentStep) {
      return 'success';
    }
  };

  getClass = (state: StepState) => {
    const { isCurrentStep } = this.props;

    if (state === 'FUTURE') {
      return 'progress-bar_empty';
    }
    if (state === 'CLOSED' && !isCurrentStep) {
      return 'progress-bar_grey';
    }
  };

  getLabel = (step: ProjectPreviewProgressBar_actualStep) => {
    const { isCurrentStep } = this.props;

    if (step.timeless === true) {
      return <FormattedMessage id="step.timeless" />;
    }
    if (step.state === 'OPENED' || isCurrentStep) {
      return <FormattedMessage id="step.status.open" />;
    }
    if (step.state === 'FUTURE') {
      return <FormattedMessage id="step.status.future" />;
    }
    if (step.state === 'CLOSED' && !isCurrentStep) {
      return <FormattedMessage id="step.status.closed" />;
    }
  };

  getWidth = (step: ProjectPreviewProgressBar_actualStep) => {
    const { isCurrentStep } = this.props;

    if (
      (step.state === 'CLOSED' && !isCurrentStep) ||
      step.state === 'FUTURE' ||
      step.timeless === true
    ) {
      return 100;
    }
    if (step.state === 'OPENED' || isCurrentStep) {
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
            className={this.getClass(actualStep.state)}
            bsStyle={this.getStyle(actualStep.state)}
            now={this.getWidth(actualStep)}
            label={this.getLabel(actualStep)}
          />
        </Progress>
      );
    }
    return null;
  }
}

export default createFragmentContainer(ProjectPreviewProgressBar, {
  project: graphql`
    fragment ProjectPreviewProgressBar_project on Project {
      steps {
        id
      }
    }
  `,
  actualStep: graphql`
    fragment ProjectPreviewProgressBar_actualStep on Step {
      timeless
      state
    }
  `,
});
