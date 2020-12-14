// @flow
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import type { DebateStepPageLogic_query } from '~relay/DebateStepPageLogic_query.graphql';
import Flex from '~ui/Primitives/Layout/Flex';
import DebateStepPageMainActions from './MainActions/DebateStepPageMainActions';
import DebateStepPageFaceToFace from './FaceToFace/DebateStepPageFaceToFace';
import DebateStepPageLinkedArticles from './LinkedArticles/DebateStepPageLinkedArticles';
import DebateStepPageArguments from './Arguments/DebateStepPageArguments';

export type Props = {|
  query: ?DebateStepPageLogic_query,
  title: string,
  isAuthenticated: boolean,
|};

export const DebateStepPageLogic = ({ query, title }: Props) => {
  const step = query?.step || null;
  return (
    <Flex direction="column" spacing={8}>
      <DebateStepPageMainActions title={title} step={step} />
      <DebateStepPageFaceToFace step={step} />
      <DebateStepPageLinkedArticles step={step} />
      <DebateStepPageArguments step={step} />
    </Flex>
  );
};

export default createFragmentContainer(DebateStepPageLogic, {
  query: graphql`
    fragment DebateStepPageLogic_query on Query
      @argumentDefinitions(stepId: { type: "ID!" }, isAuthenticated: { type: "Boolean!" }) {
      viewer @include(if: $isAuthenticated) {
        id
      }
      step: node(id: $stepId) {
        ...DebateStepPageArguments_step
        ...DebateStepPageMainActions_step
        ...DebateStepPageFaceToFace_step
        ...DebateStepPageLinkedArticles_step
      }
    }
  `,
});
