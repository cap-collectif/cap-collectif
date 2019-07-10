// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import type { GeoJson, MapOptions, ProposalMapMarker } from '../Proposal/Map/LeafletMap';
import LeafletMap from '../Proposal/Map/LeafletMap';
import type { ProposalsDisplayMap_step } from '~relay/ProposalsDisplayMap_step.graphql';
import type { MapTokens } from '../../redux/modules/user';

// c/p of ProposalsDisplayMap_step.proposals.edges[0].node because we can not pick in flow the type of an element in an
// array in flow :(
type Proposal = {|
  +title: string,
  +url: string,
  +author: {|
    +username: ?string,
    +url: string,
  |},
  +address: ?{|
    +lat: number,
    +lng: number,
  |},
|};

type RelayProps = {|
  +step: ProposalsDisplayMap_step,
|};

type Props = {|
  ...RelayProps,
  +mapTokens: MapTokens,
  +geoJsons?: Array<GeoJson>,
  +defaultMapOptions: MapOptions,
|};

const convertToMarker = (proposal: Proposal): ProposalMapMarker => ({
  author: { username: proposal.author.username || '', url: proposal.author.url },
  lat: proposal.address ? proposal.address.lat : 0,
  lng: proposal.address ? proposal.address.lng : 0,
  title: proposal.title,
  url: proposal.url,
});

const ProposalsDisplayMap = ({ step, ...rest }: Props) => {
  if (step.proposals && step.proposals.edges) {
    const markers = step.proposals.edges
      .filter(Boolean)
      .map(edge => edge.node)
      .filter(Boolean)
      .filter(proposal => proposal.address && proposal.address.lat && proposal.address.lng)
      .map(convertToMarker);

    return <LeafletMap markers={markers} {...rest} />;
  }
  return null;
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
            title
            url
            author {
              username
              url
            }
            address {
              lat
              lng
            }
          }
        }
      }
    }
  `,
});
