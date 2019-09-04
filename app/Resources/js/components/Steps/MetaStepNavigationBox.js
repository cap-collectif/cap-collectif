// @flow
import * as React from 'react';
import styled from 'styled-components';
import { graphql, QueryRenderer } from 'react-relay';
import type { RelayGlobalId } from '../../types';
import colors from '../../utils/colors';
import environment, { graphqlError } from '../../createRelayEnvironment';
import type {
  MetaStepNavigationBoxQueryResponse,
  MetaStepNavigationBoxQueryVariables,
} from '~relay/MetaStepNavigationBoxQuery.graphql';
import MetaStepNavigation from './MetaStepNavigation';

export type Props = {|
  +stepId: RelayGlobalId,
  +relatedSlug: string,
|};

export const META_STEP_NAVIGATION_HEIGHT = 100;

const MetaStepNavigationBoxInner = styled.div`
  height: ${META_STEP_NAVIGATION_HEIGHT}px;
  max-height: ${META_STEP_NAVIGATION_HEIGHT}px;
  min-height: ${META_STEP_NAVIGATION_HEIGHT}px;
  padding: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  @supports (display: grid) {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    align-items: center;
    justify-items: center;
    padding: 0;
  }
  & h2 {
    color: ${colors.white};
    margin: 0;
  }
`;

const renderMetaStepNavigation = ({
  error,
  props,
}: {
  ...ReactRelayReadyState,
  props: ?MetaStepNavigationBoxQueryResponse,
}) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }
  if (props) {
    if (props.step) {
      const { step } = props;
      return <MetaStepNavigation step={step} />;
    }
    return graphqlError;
  }
  return null;
};

export const MetaStepNavigationBox = ({ stepId, relatedSlug }: Props) => {
  return (
    <MetaStepNavigationBoxInner>
      <QueryRenderer
        environment={environment}
        query={graphql`
          query MetaStepNavigationBoxQuery($stepId: ID!, $relatedSlug: String!) {
            step: node(id: $stepId) {
              ...MetaStepNavigation_step @arguments(relatedSlug: $relatedSlug)
            }
          }
        `}
        variables={
          ({
            stepId,
            relatedSlug,
          }: MetaStepNavigationBoxQueryVariables)
        }
        render={renderMetaStepNavigation}
      />
    </MetaStepNavigationBoxInner>
  );
};

export default MetaStepNavigationBox;
