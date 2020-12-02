// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import type { DebateStepPageMainActions_step } from '~relay/DebateStepPageMainActions_step.graphql';
import AppBox from '~ui/Primitives/AppBox';

type Props = {|
  +step: ?DebateStepPageMainActions_step,
  +title: string,
|};

export const DebateStepPageMainContent = ({ step, title }: Props) => (
  // WIP
  <AppBox id={step ? 'DebateStepPageMainActions' : 'DebateStepPageMainActionsLoading'}>
    {title}
  </AppBox>
);

export default createFragmentContainer(DebateStepPageMainContent, {
  step: graphql`
    fragment DebateStepPageMainActions_step on DebateStep {
      id
    }
  `,
});
