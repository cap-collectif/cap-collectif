// @flow
import React from 'react';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Map, Marker, TileLayer } from 'react-leaflet';
import { GestureHandling } from 'leaflet-gesture-handling';
import colors from '~/utils/colors';
import config from '~/config';
import type { MapTokens } from '~/redux/modules/user';
import type { GlobalState } from '~/types';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import 'leaflet/dist/leaflet.css';
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css';
import { MAX_MAP_ZOOM } from '~/utils/styles/variables';

import type { ProposalPageLocalisation_proposal } from '~relay/ProposalPageLocalisation_proposal.graphql';
import {
  Card,
  CategoryContainer,
  CategoryCircledIcon,
  CategoryTitle,
} from '~/components/Proposal/Page/ProposalPage.style';
import Skeleton from '~ds/Skeleton';
import AppBox from '~ui/Primitives/AppBox';

type Props = {
  proposal: ProposalPageLocalisation_proposal,
  mapTokens: MapTokens,
};

let L;

const Placeholder = () => (
  <AppBox ml={4}>
    <Skeleton.Text width="100%" size="sm" mb={4} />
    <Skeleton.Text width="100%" height="130px" />
  </AppBox>
);

export const ProposalPageLocalisation = ({ proposal, mapTokens }: Props) => {
  React.useEffect(() => {
    if (config.canUseDOM) {
      L = require('leaflet'); // eslint-disable-line
      L.Map.addInitHook('addHandler', 'gestureHandling', GestureHandling);
    }
  }, []);

  if (!mapTokens) return null;
  const { publicToken, styleId, styleOwner } = mapTokens.MAPBOX;

  if (proposal && !(proposal?.address && config.canUseDOM)) return null;
  return (
    <Card>
      <CategoryContainer>
        <CategoryTitle>
          <CategoryCircledIcon>
            <Icon name={ICON_NAME.pin} size={20} color={colors.secondaryGray} />
          </CategoryCircledIcon>
          <FormattedMessage id="form.label_neighborhood" tagName="h3" />
        </CategoryTitle>
        <Skeleton placeholder={<Placeholder />} isLoaded={proposal !== null}>
          {proposal?.address && config.canUseDOM ? (
            <div className="proposal-map__block">
              <p>{proposal?.address.formatted}</p>
              <Map
                center={{
                  lat: proposal?.address.lat,
                  lng: proposal?.address.lng,
                }}
                zoom={16}
                maxZoom={MAX_MAP_ZOOM}
                style={{
                  width: '100%',
                  height: 175,
                }}
                doubleClickZoom={false}
                gestureHandling>
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
          ) : null}
        </Skeleton>
      </CategoryContainer>
    </Card>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  mapTokens: state.user.mapTokens,
});

export default createFragmentContainer(
  connect<any, any, _, _, _, _>(mapStateToProps)(ProposalPageLocalisation),
  {
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
  },
);
