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
import LoginModal from '~/components/User/Login/LoginModal';
import { useDebateStepPage } from '~/components/Debate/Page/DebateStepPage.context';

export type Props = {|
  +query: ?DebateStepPageLogic_query,
  +isAuthenticated: boolean,
|};

export const DebateStepPageLogic = ({ query }: Props) => {
  const isMobile = useIsMobile();
  const { widget } = useDebateStepPage();
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
          step={step}
          isAuthenticated={!!query?.viewer}
        />
        <DebateStepPageFaceToFace isMobile={isMobile} step={step} />
        {!widget.isSource && <DebateStepPageLinkedArticles isMobile={isMobile} step={step} />}
        <DebateStepPageArguments isMobile={isMobile} step={step} viewer={viewer} />
        <LoginModal />
      </Flex>
    );

  return <DebateStepPageNotYetStarted step={step} />;
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
