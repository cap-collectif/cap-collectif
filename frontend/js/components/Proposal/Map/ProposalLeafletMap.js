// @flow
import React, { useRef, useState } from 'react';
import { TileLayer, GeoJSON, Marker, withLeaflet } from 'react-leaflet';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import L from 'leaflet';
import { useResize } from '@liinkiing/react-hooks';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import ZoomControl from './ZoomControl';
import type { State } from '~/types';
import type { MapTokens } from '~/redux/modules/user';
import ProposalMapPopover from './ProposalMapPopover';
import type { ProposalLeafletMap_proposals } from '~relay/ProposalLeafletMap_proposals.graphql';
import {
  StyledMap,
  BlankPopup,
  SliderPane,
  CLOSED_MARKER_SIZE,
  OPENED_MARKER_SIZE,
  CLOSED_MARKER,
  OPENED_MARKER,
  locationMarkerCode,
  MapContainer,
} from './ProposalLeafletMap.style';
import { bootstrapGrid } from '~/utils/sizes';
import Address from '~/components/Form/Address/Address';

type MapCenterObject = {|
  lat: number,
  lng: number,
|};

// We should try to type Leaflet, this will do the trick in the meantime
type MapRef = {
  current: null | {
    contextValue: {
      map: {
        flyTo: (Array<number>, ?number) => void,
        panTo: (?Array<number> | null) => void,
        getPanes: () => { markerPane?: { children: Array<HTMLImageElement> } } | null,
        removeLayer: L.Marker => void,
      },
    },
  },
};

export type MapOptions = {|
  center: MapCenterObject,
  zoom: number,
|};

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
  proposals: ProposalLeafletMap_proposals,
  mapTokens: MapTokens,
  geoJsons?: Array<GeoJson>,
  defaultMapOptions: MapOptions,
  visible: boolean,
  className?: string,
|};

const convertToGeoJsonStyle = (style: Style) => {
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
    districtStyle.opacity = style.border.opacity / 100;
  }

  if (style.background) {
    districtStyle.fillColor = style.background.color;
    districtStyle.fillOpacity = style.background.opacity / 100;
  }

  return districtStyle || defaultDistrictStyle;
};

const setIcon = (element: { setIcon: (options: L.IconOptions) => void }) => {
  element.setIcon(
    L.icon({
      iconUrl: CLOSED_MARKER,
      iconSize: [CLOSED_MARKER_SIZE, CLOSED_MARKER_SIZE],
      iconAnchor: [CLOSED_MARKER_SIZE / 2, CLOSED_MARKER_SIZE],
      popupAnchor: [0, -CLOSED_MARKER_SIZE],
    }),
  );
};

const goToPosition = (mapRef: MapRef, address: ?{| +lat: number, +lng: number |}) =>
  mapRef.current?.contextValue.map.panTo([address?.lat || 0, address?.lng || 0]);

const locationIcon = L.divIcon({
  className: 'leaflet-control-locate-location',
  html: locationMarkerCode,
  iconSize: [48, 48],
});

let locationMarker: L.Marker = {};

const flyToPosition = (mapRef: MapRef, lat: number, lng: number) => {
  if (mapRef.current) {
    mapRef.current.contextValue.map.removeLayer(locationMarker);
  }
  if (mapRef.current) {
    mapRef.current.contextValue.map.flyTo([lat, lng], 18);
  }
  locationMarker = L.marker([lat, lng], { icon: locationIcon }).addTo(
    mapRef.current?.contextValue.map,
  );
};

const settingsSlider = {
  dots: false,
  infinite: true,
  speed: 500,
  centerPadding: '30px',
  centerMode: true,
  arrows: false,
};

export const ProposalLeafletMap = ({
  geoJsons,
  defaultMapOptions,
  proposals,
  visible,
  mapTokens,
  className,
}: Props) => {
  const { publicToken, styleId, styleOwner } = mapTokens.MAPBOX;
  const mapRef = useRef(null);
  const slickRef = useRef(null);
  const [isMobileSliderOpen, setIsMobileSliderOpen] = useState(false);
  const [initialSlide, setInitialSlide] = useState<number | null>(null);
  const [address, setAddress] = useState(null);
  const { width } = useResize();
  const isMobile = width < bootstrapGrid.smMin;

  const markers = proposals.filter(
    proposal => !!(proposal.address && proposal.address.lat && proposal.address.lng),
  );

  if (!visible) {
    return null;
  }

  return (
    <MapContainer isMobile={isMobile}>
      <Address
        id="address"
        getPosition={(lat, lng) => flyToPosition(mapRef, lat, lng)}
        getAddress={addressSelected =>
          flyToPosition(mapRef, addressSelected.latLng.lat, addressSelected.latLng.lng)
        }
        showSearchBar={!isMobile}
        debounce={1200}
        value={address}
        onChange={setAddress}
        placeholder="proposal.map.form.placeholder"
      />

      <StyledMap
        center={defaultMapOptions.center}
        zoom={defaultMapOptions.zoom}
        maxZoom={18}
        style={{
          height: isMobile ? '100vw' : '50vw',
        }}
        zoomControl={false}
        ref={mapRef}
        dragging={!L.Browser.mobile}
        tap={!L.Browser.mobile}
        className={className}
        onPopupClose={e => {
          setIcon(e.popup._source);
        }}
        onClick={() => setIsMobileSliderOpen(false)}
        onZoomStart={() => setIsMobileSliderOpen(false)}>
        <TileLayer
          attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/#/-74.5/40/10">Improve this map</a>'
          url={`https://api.mapbox.com/styles/v1/${styleOwner}/${styleId}/tiles/256/{z}/{x}/{y}?access_token=${publicToken}`}
        />
        <MarkerClusterGroup
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
          zoomToBoundsOnClick
          maxClusterRadius={30}>
          {markers?.length > 0 &&
            markers.map((mark, key) => {
              const iconUrl = key === initialSlide ? OPENED_MARKER : CLOSED_MARKER;
              const size = key === initialSlide ? OPENED_MARKER_SIZE : CLOSED_MARKER_SIZE;
              return (
                <Marker
                  key={key}
                  position={[mark.address?.lat, mark.address?.lng]}
                  alt={`marker-${key}`}
                  icon={L.icon({
                    iconUrl,
                    iconSize: [size, size],
                    iconAnchor: [size / 2, size],
                    popupAnchor: [0, -size],
                  })}
                  onClick={e => {
                    const isOpen: boolean = e.target.isPopupOpen();
                    setInitialSlide(isOpen ? key : null);
                    setIsMobileSliderOpen(isOpen);
                    if (isMobile) {
                      goToPosition(mapRef, markers[key].address);
                      if (slickRef?.current) slickRef.current.slickGoTo(key);
                    }
                  }}>
                  <BlankPopup closeButton={false}>
                    <ProposalMapPopover proposal={mark} />
                  </BlankPopup>
                </Marker>
              );
            })}
        </MarkerClusterGroup>
        {geoJsons &&
          geoJsons.map((geoJson, key) => (
            <GeoJSON
              style={convertToGeoJsonStyle(geoJson.style)}
              key={key}
              data={geoJson.district}
            />
          ))}

        {!isMobile && <ZoomControl position="bottomright" />}
      </StyledMap>
      {isMobileSliderOpen && isMobile && (
        <SliderPane
          ref={slickRef}
          {...settingsSlider}
          initialSlide={initialSlide !== null ? initialSlide : 0}
          afterChange={current => {
            setInitialSlide(current);
            // TODO find a better way
            // We need to wait leaflet to rerender the markers before moving
            setTimeout(() => goToPosition(mapRef, markers[current].address), 1);
          }}>
          {markers.map(marker => (
            <ProposalMapPopover proposal={marker} key={marker.id} isMobile />
          ))}
        </SliderPane>
      )}
    </MapContainer>
  );
};

ProposalLeafletMap.defaultProps = {
  proposals: [],
  defaultMapOptions: {
    center: { lat: 48.8586047, lng: 2.3137325 },
    zoom: 12,
    zoomControl: false,
  },
  visible: true,
};

const mapStateToProps = (state: State) => ({
  mapTokens: state.user.mapTokens,
});

const container = connect(mapStateToProps)(withLeaflet(ProposalLeafletMap));

export default createFragmentContainer(container, {
  proposals: graphql`
    fragment ProposalLeafletMap_proposals on Proposal @relay(plural: true) {
      address {
        lat
        lng
      }
      ...ProposalMapPopover_proposal
      id
    }
  `,
});
