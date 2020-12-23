// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import type { DebateStepPageNotYetStarted_step } from '~relay/DebateStepPageNotYetStarted_step.graphql';
import AppBox from '~ui/Primitives/AppBox';

type Props = {|
  +title: string,
  +step: ?DebateStepPageNotYetStarted_step,
|};

// WIP
export const DebateStepPageNotYetStarted = ({ step }: Props) => {
  return <AppBox id="DebateStepPageNotYetStarted">{step?.timeRange?.startAt}</AppBox>;
};

export default createFragmentContainer(DebateStepPageNotYetStarted, {
  step: graphql`
    fragment DebateStepPageNotYetStarted_step on DebateStep {
      id
      timeRange {
        startAt
      }
    }
  `,
});
