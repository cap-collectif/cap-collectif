// @flow
import React from 'react';
import moment from 'moment';
import { createFragmentContainer, graphql } from 'react-relay';
import type { DebateStepPageArguments_step } from '~relay/DebateStepPageArguments_step.graphql';
import type { DebateStepPageArguments_viewer } from '~relay/DebateStepPageArguments_viewer.graphql';
import MobileDebateStepPageArguments from '~/components/Debate/Page/Arguments/MobileDebateStepPageArguments';
import DesktopDebateStepPageArguments from '~/components/Debate/Page/Arguments/DesktopDebateStepPageArguments';

type Props = {|
  +step: ?DebateStepPageArguments_step,
  +viewer: ?DebateStepPageArguments_viewer,
  +isMobile?: boolean,
|};

export const DebateStepPageArguments = ({ step, viewer, isMobile }: Props) => {
  if (step?.debate?.arguments.totalCount === 0) {
    return null;
  }
  const isStepFinished = step?.timeless
    ? false
    : step?.timeRange?.endAt
    ? moment().isAfter(moment(step?.timeRange?.endAt))
    : false;
  const isStartedAndNoEndDate = step?.timeless
    ? false
    : !step?.timeRange?.endAt && moment().isAfter(moment(step?.timeRange.startAt));
  const isStepClosed = isStepFinished || isStartedAndNoEndDate;

  return isMobile ? (
    <>
      {step?.debate && (
        <MobileDebateStepPageArguments
          debate={step.debate}
          viewer={viewer}
          isStepClosed={isStepClosed}
        />
      )}
    </>
  ) : (
    // TODO fixme https://github.com/cap-collectif/platform/issues/12130
    // About step => $fragmentRefs is missing in DebateStepPageArguments_step
    // Would be fix if we transform DesktopDebateStepPageArguments in fragment
    // $FlowFixMe
    <DesktopDebateStepPageArguments step={step} viewer={viewer} isStepClosed={isStepClosed} />
  );
};

export default createFragmentContainer(DebateStepPageArguments, {
  step: graphql`
    fragment DebateStepPageArguments_step on DebateStep {
      timeless
      timeRange {
        startAt
        endAt
      }
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
        arguments(first: 0, isPublished: true, isTrashed: false) {
          totalCount
        }
        viewerUnpublishedArgument @include(if: $isAuthenticated) {
          type
          id
          ...ArgumentCard_argument @arguments(isAuthenticated: $isAuthenticated)
        }
        ...MobileDebateStepPageArguments_debate @arguments(isAuthenticated: $isAuthenticated)
      }
    }
  `,
  viewer: graphql`
    fragment DebateStepPageArguments_viewer on User {
      ...MobileDebateStepPageArguments_viewer
      ...DesktopDebateStepPageArguments_viewer
    }
  `,
});
