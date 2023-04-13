// @flow
import * as React from 'react';
import { useLazyLoadQuery, graphql } from 'react-relay';
import type { VoteStepMapQueryQuery as VoteStepMapQueryQueryType } from '~relay/VoteStepMapQueryQuery.graphql';
import VoteStepMap from './VoteStepMap';
import type { MapCenterObject } from '~/components/Proposal/Map/Map.types';

const QUERY = graphql`
  query VoteStepMapQueryQuery($stepId: ID!, $count: Int!, $cursor: String) {
    voteStep: node(id: $stepId) {
      ... on SelectionStep {
        ...VoteStepMap_step @arguments(count: $count, cursor: $cursor)
      }
    }
  }
`;

type Props = {|
  +stepId: string,
  +handleMapPositionChange: string => void,
  +defaultCenter: MapCenterObject | null,
|};

export const VoteStepMapQuery = ({ stepId, handleMapPositionChange, defaultCenter }: Props) => {
  const data = useLazyLoadQuery<VoteStepMapQueryQueryType>(
    QUERY,
    {
      stepId,
      count: 50,
      cursor: null,
    },
    { fetchPolicy: 'store-and-network' },
  );

  if (!data || !data.voteStep) return null;

  const { voteStep } = data;

  return (
    <VoteStepMap
      voteStep={voteStep}
      handleMapPositionChange={handleMapPositionChange}
      defaultCenter={defaultCenter}
    />
  );
};

export default VoteStepMapQuery;
