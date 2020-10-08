// @flow
import React from 'react';
import { connect } from 'react-redux';
import ReactPlaceholder from 'react-placeholder';
import { TextRow } from 'react-placeholder/lib/placeholders';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Map, Marker, TileLayer } from 'react-leaflet';
import colors from '~/utils/colors';
import config from '~/config';
import type { MapTokens } from '~/redux/modules/user';
import type { GlobalState } from '~/types';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';

import type { ProposalPageLocalisation_proposal } from '~relay/ProposalPageLocalisation_proposal.graphql';
import {
  Card,
  CategoryContainer,
  CategoryCircledIcon,
  CategoryTitle,
} from '~/components/Proposal/Page/ProposalPage.style';

type Props = {
  proposal: ProposalPageLocalisation_proposal,
  mapTokens: MapTokens,
};

let L;

const placeholder = (
  <div style={{ marginLeft: 15 }}>
    <TextRow color={colors.borderColor} style={{ width: '100%', height: 12, marginTop: 5 }} />
    <TextRow color={colors.borderColor} style={{ width: '100%', height: 130, marginTop: 15 }} />
  </div>
);

export const ProposalPageLocalisation = ({ proposal, mapTokens }: Props) => {
  if (!mapTokens) return null;
  const { publicToken, styleId, styleOwner } = mapTokens.MAPBOX;
  if (config.canUseDOM) {
    L = require('leaflet'); // eslint-disable-line
  }

  if (proposal && !(proposal?.address && config.canUseDOM)) return null;
  return (
    <Card>
      <CategoryContainer>
        <CategoryTitle>
          <CategoryCircledIcon>
            <Icon name={ICON_NAME.pin} size={20} color={colors.secondaryGray} />
          </CategoryCircledIcon>
          <h3>
            <FormattedMessage id="form.label_neighborhood" />
          </h3>
        </CategoryTitle>
        <ReactPlaceholder
          showLoadingAnimation
          customPlaceholder={placeholder}
          ready={proposal !== null}>
          {proposal?.address && config.canUseDOM && (
            <div className="proposal-map__block">
              <p>{proposal?.address.formatted}</p>
              <Map
                center={{
                  lat: proposal?.address.lat,
                  lng: proposal?.address.lng,
                }}
                zoom={16}
                maxZoom={18}
                style={{
                  width: '100%',
                  height: 175,
                }}>
                <TileLayer
                  attribution='&copy; <a href"https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> <a href"https://www.mapbox.com/map-feedback/#/-74.5/40/10">Improve this map</a>'
                  url={`https://api.mapbox.com/styles/v1/${styleOwner}/${styleId}/tiles/256/{z}/{x}/{y}?access_token=${publicToken}`}
                />
                <Marker
                  position={[proposal?.address.lat, proposal?.address.lng]}
                  icon={L.icon({
                    iconUrl: '/svg/marker.svg',
                    iconSize: [40, 40],
                    iconAnchor: [20, 40],
                    popupAnchor: [0, -40],
                  })}
                />
              </Map>
            </div>
          )}
        </ReactPlaceholder>
      </CategoryContainer>
    </Card>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  mapTokens: state.user.mapTokens,
});

export default createFragmentContainer(connect(mapStateToProps)(ProposalPageLocalisation), {
  proposal: graphql`
    fragment ProposalPageLocalisation_proposal on Proposal {
      id
      address {
        formatted
        lat
        lng
      }
    }
  `,
});
