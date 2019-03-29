// @flow
import * as React from 'react';
import moment from 'moment';
import { graphql, createFragmentContainer } from 'react-relay';
import type { ImplementationStepTitle_progressSteps } from './__generated__/ImplementationStepTitle_progressSteps.graphql';

type Props = {
  progressSteps: ImplementationStepTitle_progressSteps,
};

export class ImplementationStepTitle extends React.Component<Props> {
  getStepTitle = (steps: ImplementationStepTitle_progressSteps) => {
    const openSteps = steps.filter(step => {
      if (step.startAt && step.endAt) {
        return moment().isBetween(step.startAt, step.endAt);
      }
      return false;
    });
    const openTimelessSteps = steps.filter(
      step => !step.endAt && step.startAt && moment().isAfter(step.startAt),
    );
    const toComeSteps = steps.filter(step => step.startAt && moment().isBefore(step.startAt));
    const endSteps = steps[steps.length - 1];

    if (openSteps.length > 0) {
      return openSteps[0].title;
    }

    if (openTimelessSteps.length > 0) {
      return openTimelessSteps[openTimelessSteps.length - 1].title;
    }

    if (toComeSteps.length > 0) {
      return toComeSteps[0].title;
    }

    if (endSteps) {
      return endSteps.title;
    }
  };

  render() {
    const { progressSteps } = this.props;

    if (progressSteps) {
      return <React.Fragment>{this.getStepTitle(progressSteps)}</React.Fragment>;
    }

    return null;
  }
}

export default createFragmentContainer(ImplementationStepTitle, {
  progressSteps: graphql`
    fragment ImplementationStepTitle_progressSteps on ProgressStep @relay(plural: true) {
      id
      title
      startAt
      endAt
    }
  `,
});
