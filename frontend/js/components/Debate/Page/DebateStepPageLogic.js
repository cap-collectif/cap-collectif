// @flow
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import type { DebateStepPageLogic_query } from '~relay/DebateStepPageLogic_query.graphql';
import Flex from '~ui/Primitives/Layout/Flex';
import DebateStepPageMainActions from './MainActions/DebateStepPageMainActions';
import DebateStepPageFaceToFace from './FaceToFace/DebateStepPageFaceToFace';
import DebateStepPageLinkedArticles from './LinkedArticles/DebateStepPageLinkedArticles';
import DebateStepPageArguments from './Arguments/DebateStepPageArguments';
import DebateStepPageNotYetStarted from './NotYetStarted/DebateStepPageNotYetStarted';
import useIsMobile from '~/utils/hooks/useIsMobile';
import WYSIWYGRender from '~/components/Form/WYSIWYGRender';
import LoginModal from '~/components/User/Login/LoginModal';
import { useDebateStepPage } from '~/components/Debate/Page/DebateStepPage.context';

export type Props = {|
  +query: ?DebateStepPageLogic_query,
|};

export const DebateStepPageLogic = ({ query }: Props) => {
  const isMobile = useIsMobile();
  const { widget } = useDebateStepPage();
  const step = query?.step || null;
  const viewer = query?.viewer || null;
  const showContent = query?.step?.debateType === 'WYSIWYG' && query?.step?.debateContent !== '';
  const showFaceToFace = query?.step?.debateType === 'FACE_TO_FACE';
  const hasStarted = query?.step?.timeRange?.hasStarted;

  if (!hasStarted && step) return <DebateStepPageNotYetStarted step={step} />;

  return (
    <Flex direction="column" spacing={8}>
      <DebateStepPageMainActions isMobile={isMobile} step={step} />
      {showContent && <WYSIWYGRender value={step?.debateContent || ''} />}
      {(showFaceToFace || !step) && (
        <>
          <DebateStepPageFaceToFace isMobile={isMobile} step={step} />
          {!widget.isSource && <DebateStepPageLinkedArticles isMobile={isMobile} step={step} />}
        </>
      )}
      <DebateStepPageArguments isMobile={isMobile} step={step} viewer={viewer} />
      <LoginModal />
    </Flex>
  );
};

export default createFragmentContainer(DebateStepPageLogic, {
  query: graphql`
    fragment DebateStepPageLogic_query on Query
      @argumentDefinitions(stepId: { type: "ID!" }, isAuthenticated: { type: "Boolean!" }) {
      viewer @include(if: $isAuthenticated) {
        ...DebateStepPageArguments_viewer
      }
      step: node(id: $stepId) {
        ... on Step {
          timeRange {
            hasStarted
          }
        }
        ... on DebateStep {
          debateType
          debateContent
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
