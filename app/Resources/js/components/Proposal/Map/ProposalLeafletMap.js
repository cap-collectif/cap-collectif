// @flow
import React from 'react';
import { Map, TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import styled from 'styled-components';
import LocateControl from './LocateControl';
import LeafletSearch from './LeafletSearch';
import type { State } from '../../../types';
import type { MapTokens } from '../../../redux/modules/user';
import ProposalMapPopover from './ProposalMapPopover';
import type { ProposalMapPopover_proposal } from '~relay/ProposalMapPopover_proposal.graphql';

type MapCenterObject = {|
  lat: number,
  lng: number,
|};

export type MapOptions = {|
  center: MapCenterObject,
  zoom: number,
|};

export type Proposal = {|
  ...ProposalMapPopover_proposal,
  +address: ?{|
    +lat: number,
    +lng: number,
  |},
|};

type Proposals = $ReadOnlyArray<{|
  ...Proposal,
|}>;

type Style = {|
  border: {
    color: string,
    id: string,
    enabled: boolean,
    opacity: number,
    size: number,
    style_type: string,
  },
  background: {
    color: string,
    id: string,
    enabled: boolean,
    opacity: number,
    style_type: string,
  },
|};

export type GeoJson = {|
  district: string,
  style: Style,
|};

type Props = {|
  proposals: Proposals,
  mapTokens: MapTokens,
  geoJsons?: Array<GeoJson>,
  defaultMapOptions: MapOptions,
  visible: boolean,
  className?: string,
|};

function convertToGeoJsonStyle(style: Style) {
  const defaultDistrictStyle = {
    color: '#ff0000',
    weight: 1,
    opacity: 0.3,
  };

  if (!style.border && !style.background) {
    return defaultDistrictStyle;
  }

  const districtStyle = {};

  if (style.border) {
    districtStyle.color = style.border.color;
    districtStyle.weight = style.border.size;
    districtStyle.opacity = style.border.opacity;
  }

  if (style.background) {
    districtStyle.fillColor = style.background.color;
    districtStyle.fillOpacity = style.background.opacity;
  }

  return districtStyle || defaultDistrictStyle;
}

const BlankPopup = styled(Popup)`
  .leaflet-popup-content {
    margin: 0px;
    width: 260px !important;
  }

  .leaflet-popup-content-wrapper {
    border-radius: 4px;
  }
`;

export const ProposalLeafletMap = ({
  geoJsons,
  defaultMapOptions,
  proposals,
  visible,
  mapTokens,
  className,
}: Props) => {
  const { publicToken, styleId, styleOwner } = mapTokens.MAPBOX;

  if (!visible) {
    return null;
  }

  const markers = proposals.filter(
    proposal => !!(proposal.address && proposal.address.lat && proposal.address.lng),
  );

  return (
    <Map
      center={defaultMapOptions.center}
      zoom={defaultMapOptions.zoom}
      maxZoom={18}
      style={{
        width: '100%',
        height: '50vw',
      }}
      className={className}>
      <TileLayer
        attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/#/-74.5/40/10">Improve this map</a>'
        url={`https://api.mapbox.com/styles/v1/${styleOwner}/${styleId}/tiles/256/{z}/{x}/{y}?access_token=${publicToken}`}
      />
      <MarkerClusterGroup
        spiderfyOnMaxZoom
        showCoverageOnHover={false}
        zoomToBoundsOnClick
        maxClusterRadius={30}>
        {markers &&
          markers.length > 0 &&
          markers.map((mark, key) => (
            <Marker
              key={key}
              position={[mark.address && mark.address.lat, mark.address && mark.address.lng]}
              icon={L.icon({
                iconUrl: '/svg/marker.svg',
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -40],
              })}>
              <BlankPopup closeButton={false}>
                <ProposalMapPopover proposal={mark} />
              </BlankPopup>
            </Marker>
          ))}
      </MarkerClusterGroup>
      {geoJsons &&
        geoJsons.map((geoJson, key) => (
          <GeoJSON style={convertToGeoJsonStyle(geoJson.style)} key={key} data={geoJson.district} />
        ))}
      <LocateControl />
      <LeafletSearch />
    </Map>
  );
};
ProposalLeafletMap.defaultProps = {
  proposals: [],
  defaultMapOptions: {
    center: { lat: 48.8586047, lng: 2.3137325 },
    zoom: 12,
  },
  visible: true,
};

const mapStateToProps = (state: State) => ({
  mapTokens: state.user.mapTokens,
});

const container = connect(mapStateToProps)(ProposalLeafletMap);

export default createFragmentContainer(container, {
  proposals: graphql`
    fragment ProposalLeafletMap_proposals on Proposal @relay(plural: true) {
      address {
        lat
        lng
      }
      ...ProposalMapPopover_proposal
    }
  `,
});
