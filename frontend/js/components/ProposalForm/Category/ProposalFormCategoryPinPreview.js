// @flow
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import styled, { type StyledComponent } from 'styled-components';
import { connect } from 'react-redux';
import { Map, Marker, TileLayer } from 'react-leaflet';
import { MAIN_BORDER_RADIUS } from '~/utils/styles/variables';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import colors from '~/utils/colors';
import type { MapTokens } from '~/redux/modules/user';
import type { GlobalState } from '~/types';
import config from '~/config';

let L;

type Props = {|
  +color: string,
  +icon: string,
  mapTokens: MapTokens,
|};

const Container: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  max-height: 128px;
  min-height: 115px;
  position: relative;
  width: 49%;
  ${MAIN_BORDER_RADIUS};
  border: 1px solid #e3e3e3;

  .preview-icn svg:nth-child(2) {
    position: absolute;
    top: 7px;
    left: 12px;
  }

  .leaflet-bottom.leaflet-right {
    display: none;
  }
`;

export const ProposalFormCategoryPinPreview = ({ color, icon, mapTokens }: Props) => {
  if (!mapTokens) return null;
  const { publicToken, styleId, styleOwner } = mapTokens.MAPBOX;
  if (config.canUseDOM) {
    L = require('leaflet'); // eslint-disable-line
  }
  return (
    <Container>
      <Map
        center={{
          lat: 48.8604,
          lng: 2.3507,
        }}
        doubleClickZoom={false}
        dragging={false}
        touchZoom={false}
        scrollWheelZoom={false}
        zoom={16}
        zoomControl={false}
        style={{
          width: '100%',
          height: '100%',
        }}>
        <TileLayer
          attribution='&copy; <a href"https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> <a href"https://www.mapbox.com/map-feedback/#/-74.5/40/10">Improve this map</a>'
          url={`https://api.mapbox.com/styles/v1/${styleOwner}/${styleId}/tiles/256/{z}/{x}/{y}?access_token=${publicToken}`}
        />
        <Marker
          position={[48.8601, 2.3507]}
          icon={L.divIcon({
            className: 'preview-icn',
            html: renderToString(
              <>
                <Icon name={ICON_NAME.pin3} size={40} color={color} />
                {icon && <Icon name={ICON_NAME[icon]} size={16} color={colors.white} />}
              </>,
            ),
            iconSize: [34, 48],
            iconAnchor: [17, 48],
          })}
        />
      </Map>
    </Container>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  mapTokens: state.user.mapTokens,
});

export default connect(mapStateToProps)(ProposalFormCategoryPinPreview);
