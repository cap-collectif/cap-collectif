// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import type { GeoJson, MapOptions } from '../Proposal/Map/ProposalLeafletMap';
import ProposalLeafletMap from '../Proposal/Map/ProposalLeafletMap';
import type { ProposalsDisplayMap_step } from '~relay/ProposalsDisplayMap_step.graphql';
import type { MapTokens } from '../../redux/modules/user';

type RelayProps = {|
  +step: ProposalsDisplayMap_step,
|};

type Props = {|
  ...RelayProps,
  +mapTokens: MapTokens,
  +geoJsons?: Array<GeoJson>,
  +defaultMapOptions: MapOptions,
|};

export const ProposalsDisplayMap = ({ step, ...rest }: Props) => {
  return step.proposals && step.proposals.edges ? (
    <ProposalLeafletMap
      proposals={step.proposals.edges.filter(Boolean).map(edge => edge.node)}
      {...rest}
    />
  ) : null;
};

export default createFragmentContainer(ProposalsDisplayMap, {
  step: graphql`
    fragment ProposalsDisplayMap_step on ProposalStep {
      proposals(
        first: $count
        after: $cursor
        orderBy: $orderBy
        term: $term
        district: $district
        theme: $theme
        category: $category
        status: $status
        userType: $userType
      ) @connection(key: "ProposalsDisplayMap_proposals", filters: []) {
        edges {
          node {
            id
            ...ProposalLeafletMap_proposals
          }
        }
      }
    }
  `,
});
