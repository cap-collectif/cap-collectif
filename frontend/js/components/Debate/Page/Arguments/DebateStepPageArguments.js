// @flow
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import type { DebateStepPageArguments_step } from '~relay/DebateStepPageArguments_step.graphql';
import MobileDebateStepPageArguments from '~/components/Debate/Page/Arguments/MobileDebateStepPageArguments';
import DesktopDebateStepPageArguments from '~/components/Debate/Page/Arguments/DesktopDebateStepPageArguments';

type Props = {|
  +step: ?DebateStepPageArguments_step,
  +isMobile?: boolean,
|};

export const DebateStepPageArguments = ({ step, isMobile }: Props) => {
  return isMobile ? (
    <>{step?.debate && <MobileDebateStepPageArguments debate={step.debate} />}</>
  ) : (
    <DesktopDebateStepPageArguments step={step} />
  );
};

export default createFragmentContainer(DebateStepPageArguments, {
  step: graphql`
    fragment DebateStepPageArguments_step on DebateStep {
      noDebate: debate {
        id
        ...DebateStepPageArgumentsPagination_debate
          @arguments(
            isAuthenticated: $isAuthenticated
            value: AGAINST
            orderBy: { field: PUBLISHED_AT, direction: DESC }
          )
      }
      yesDebate: debate {
        id
        ...DebateStepPageArgumentsPagination_debate
          @arguments(
            isAuthenticated: $isAuthenticated
            value: FOR
            orderBy: { field: PUBLISHED_AT, direction: DESC }
          )
      }
      debate {
        id
        arguments(first: 0) {
          totalCount
        }
        ...MobileDebateStepPageArguments_debate @arguments(isAuthenticated: $isAuthenticated)
      }
    }
  `,
});
