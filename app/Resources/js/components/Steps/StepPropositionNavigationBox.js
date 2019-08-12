// @flow
import * as React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import type { ReadyState } from 'react-relay';
import { graphql, QueryRenderer } from 'react-relay';
import type { RelayGlobalId } from '../../types';
import colors from '../../utils/colors';
import environment, { graphqlError } from '../../createRelayEnvironment';
import type {
  StepPropositionNavigationBoxQueryResponse,
  StepPropositionNavigationBoxQueryVariables,
} from '~relay/StepPropositionNavigationBoxQuery.graphql';
import StepPropositionNavigation from './StepPropositionNavigation';

type Props = {|
  +stepId: RelayGlobalId,
  +relatedSlug: string,
|}

export const STEP_PROPOSITION_NAVIGATION_HEIGHT = 120;

const StepPropositionNavigationBoxInner = styled.div`
  height: ${STEP_PROPOSITION_NAVIGATION_HEIGHT}px;
  max-height: ${STEP_PROPOSITION_NAVIGATION_HEIGHT}px;
  min-height: ${STEP_PROPOSITION_NAVIGATION_HEIGHT}px;
  padding: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  & h2 {
    color: ${colors.white};
    margin: 0;    
  }
`;

const renderStepPropositionNavigation = (
  {
    error,
    props,
  }: {
    ...ReadyState,
    props: ?StepPropositionNavigationBoxQueryResponse,
  },
) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }
  if (props) {
    if (props.step) {
      const { step } = props;
      return (
        // $FlowFixMe
        <StepPropositionNavigation step={step}/>
      );
    }
    return graphqlError;
  }
  return null;
};

const StepPropositionNavigationBox = ({ stepId, relatedSlug }: Props) => {
  return (
    <StepPropositionNavigationBoxInner>
      <QueryRenderer
        environment={environment}
        query={graphql`
            query StepPropositionNavigationBoxQuery(
              $stepId: ID!
              $relatedSlug: String!
            ) {
              step: node(id: $stepId) {
                ...StepPropositionNavigation_step @arguments(relatedSlug: $relatedSlug)
              }
            }
          `}
        variables={
          ({
            stepId,
            relatedSlug
          }: StepPropositionNavigationBoxQueryVariables)
        }
        render={renderStepPropositionNavigation}
      />
    </StepPropositionNavigationBoxInner>
  );
};

export default StepPropositionNavigationBox;
