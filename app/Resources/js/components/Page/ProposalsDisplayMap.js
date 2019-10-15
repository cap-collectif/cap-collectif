// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { connect } from 'react-redux';
import { useIntl } from 'react-intl';
import type { IntlShape } from 'react-intl';
import moment from 'moment';
import type { GeoJson, MapOptions, ProposalMapMarker } from '../Proposal/Map/LeafletMap';
import LeafletMap from '../Proposal/Map/LeafletMap';
import type { ProposalsDisplayMap_step } from '~relay/ProposalsDisplayMap_step.graphql';
import type { MapTokens } from '../../redux/modules/user';
import type { State, FeatureToggles } from '../../types';

// c/p of ProposalsDisplayMap_step.proposals.edges[0].node because we can not pick in flow the type of an element in an
// array in flow :(
type Proposal = {|
  +title: string,
  +url: string,
  +publishedAt: ?string,
  +media: ?{|
    +url: string,
  |},
  +author: {|
    +username: ?string,
    +url: string,
    +media: ?{|
      +url: string,
    |},
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
  +features: FeatureToggles,
  defaultAvatar?: ?string,
|};

const convertToMarker = (
  proposal: Proposal,
  features: FeatureToggles,
  defaultAvatar?: ?string,
  intl: IntlShape,
): ProposalMapMarker => ({
  author: {
    username: proposal.author.username || '',
    url: proposal.author.url,
    media: proposal.author.media || (defaultAvatar ? { url: defaultAvatar } : null),
  },
  lat: proposal.address ? proposal.address.lat : 0,
  lng: proposal.address ? proposal.address.lng : 0,
  title: proposal.title,
  media:
    (features.display_pictures_in_depository_proposals_list &&
      proposal.media &&
      proposal.media.url) ||
    null,
  url: proposal.url,
  date: proposal.publishedAt
    ? intl.formatDate(moment(proposal.publishedAt), {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '',
});

export const getProposalsMarkers = (
  proposals: $ReadOnlyArray<Proposal>,
  features: FeatureToggles,
  defaultAvatar?: ?string,
  intl: IntlShape,
): $ReadOnlyArray<ProposalMapMarker> =>
  proposals
    .filter(proposal => !!(proposal.address && proposal.address.lat && proposal.address.lng))
    .map(p => convertToMarker(p, features, defaultAvatar, intl));

export const ProposalsDisplayMap = ({ step, features, defaultAvatar, ...rest }: Props) => {
  const intl = useIntl();

  if (step.proposals && step.proposals.edges) {
    const markers = getProposalsMarkers(
      step.proposals.edges.filter(Boolean).map(edge => edge.node),
      features,
      defaultAvatar,
      intl,
    );

    return <LeafletMap markers={markers} {...rest} />;
  }
  return null;
};

const mapStateToProps = (state: State) => ({
  features: state.default.features,
  defaultAvatar: state.default.images && state.default.images.avatar,
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
            title
            url
            publishedAt
            media {
              url
            }
            author {
              username
              url
              media {
                url
              }
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
