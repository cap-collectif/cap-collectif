// @flow
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import moment from 'moment';
import type { DebateStepPageLogic_query } from '~relay/DebateStepPageLogic_query.graphql';
import Flex from '~ui/Primitives/Layout/Flex';
import DebateStepPageMainActions from './MainActions/DebateStepPageMainActions';
import DebateStepPageFaceToFace from './FaceToFace/DebateStepPageFaceToFace';
import DebateStepPageLinkedArticles from './LinkedArticles/DebateStepPageLinkedArticles';
import DebateStepPageArguments from './Arguments/DebateStepPageArguments';
import DebateStepPageNotYetStarted from './NotYetStarted/DebateStepPageNotYetStarted';
import useIsMobile from '~/utils/hooks/useIsMobile';

export type Props = {|
  query: ?DebateStepPageLogic_query,
  title: string,
  isAuthenticated: boolean,
|};

export const DebateStepPageLogic = ({ query, title }: Props) => {
  const isMobile = useIsMobile();
  const step = query?.step || null;
  const viewer = query?.viewer || null;
  const startAt = query?.step?.timeRange?.startAt || null;
  const isTimeless = query?.step?.timeless || false;
  const isStarted = startAt != null ? moment().isAfter(startAt) : false;

  if (isTimeless || isStarted || !step)
    return (
      <Flex direction="column" spacing={8}>
        <DebateStepPageMainActions
          isMobile={isMobile}
          title={title}
          step={step}
          isAuthenticated={!!query?.viewer}
        />
        <DebateStepPageFaceToFace isMobile={isMobile} step={step} />
        <DebateStepPageLinkedArticles isMobile={isMobile} step={step} />
        <DebateStepPageArguments isMobile={isMobile} step={step} viewer={viewer} />
      </Flex>
    );
  return <DebateStepPageNotYetStarted step={step} title={title} />;
};

export default createFragmentContainer(DebateStepPageLogic, {
  query: graphql`
    fragment DebateStepPageLogic_query on Query
      @argumentDefinitions(stepId: { type: "ID!" }, isAuthenticated: { type: "Boolean!" }) {
      viewer @include(if: $isAuthenticated) {
        ...DebateStepPageArguments_viewer
      }
      step: node(id: $stepId) {
        ... on DebateStep {
          timeless
          timeRange {
            startAt
          }
        }
        ...DebateStepPageNotYetStarted_step
        ...DebateStepPageArguments_step
        ...DebateStepPageMainActions_step
        ...DebateStepPageFaceToFace_step
        ...DebateStepPageLinkedArticles_step
      }
    }
  `,
});
