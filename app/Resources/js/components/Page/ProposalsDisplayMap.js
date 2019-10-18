// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { connect } from 'react-redux';

import type { GeoJson, MapOptions } from '../Proposal/Map/ProposalLeafletMap';
import ProposalLeafletMap from '../Proposal/Map/ProposalLeafletMap';
import type { ProposalsDisplayMap_step } from '~relay/ProposalsDisplayMap_step.graphql';
import type { MapTokens } from '../../redux/modules/user';
import type { State, FeatureToggles } from '../../types';

type RelayProps = {|
  +step: ProposalsDisplayMap_step,
|};

type Props = {|
  ...RelayProps,
  +mapTokens: MapTokens,
  +geoJsons?: Array<GeoJson>,
  +defaultMapOptions: MapOptions,
  +features: FeatureToggles,
|};

export const ProposalsDisplayMap = ({ step, features, ...rest }: Props) => {
  return step.proposals && step.proposals.edges ? (
    <ProposalLeafletMap
      proposals={step.proposals.edges.filter(Boolean).map(edge => edge.node)}
      {...rest}
    />
  ) : null;
};

const mapStateToProps = (state: State) => ({
  features: state.default.features,
});

const container = connect(mapStateToProps)(ProposalsDisplayMap);

export default createFragmentContainer(container, {
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
