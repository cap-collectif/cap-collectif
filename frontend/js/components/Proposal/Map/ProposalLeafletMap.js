// @flow
import React, { useRef, useState, useEffect } from 'react';
import { renderToString } from 'react-dom/server';
import noop from 'lodash/noop';
import { change } from 'redux-form';
import { TileLayer, GeoJSON, Marker, Popup } from 'react-leaflet';
import { GestureHandling } from 'leaflet-gesture-handling';
import 'leaflet/dist/leaflet.css';
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import L from 'leaflet';
import { useResize, useDisclosure } from '@liinkiing/react-hooks';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import ZoomControl from './ZoomControl';
import type { MapCenterObject, MapOptions, MapProps, MapRef, PopupRef } from './Map.types';
import type { State, Dispatch } from '~/types';
import type { MapTokens } from '~/redux/modules/user';
import ProposalMapPopover from './ProposalMapPopover';
import LoginOverlay from '~/components/Utils/LoginOverlay';
import type { ProposalLeafletMap_proposals } from '~relay/ProposalLeafletMap_proposals.graphql';
import type { ProposalLeafletMap_proposalForm } from '~relay/ProposalLeafletMap_proposalForm.graphql';
import { isSafari, Emitter } from '~/config';

import {
  StyledMap,
  BlankPopup,
  SliderPane,
  CLOSED_MARKER_SIZE,
  OPENED_MARKER_SIZE,
  locationMarkerCode,
  MapContainer,
} from './ProposalLeafletMap.style';
import { bootstrapGrid } from '~/utils/sizes';
import Address from '~/components/Form/Address/Address';
import type { AddressComplete } from '~/components/Form/Address/Address.type';
import ProposalMapLoaderPane from './ProposalMapLoaderPane';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import colors from '~/utils/colors';
import { MAX_MAP_ZOOM } from '~/utils/styles/variables';
import { geoContains, type GeoJson, convertToGeoJsonStyle } from '~/utils/geojson';
import ProposalMapDiscoverPane from './ProposalMapDiscoverPane';
import { getAddressFromLatLng } from '~/utils/googleMapAddress';
import { formName } from '~/components/Proposal/Form/ProposalForm';
import ProposalMapOutOfAreaPane from './ProposalMapOutOfAreaPane';
import ProposalCreateModal from '../Create/ProposalCreateModal';
import { getProposalLabelByType } from '~/utils/interpellationLabelHelper';
import Button from '~ds/Button/Button';
import { mapToast, MapEvents } from './Map.events';

type Props = {|
  proposals: ProposalLeafletMap_proposals,
  mapTokens: MapTokens,
  geoJsons?: Array<GeoJson>,
  defaultMapOptions: MapOptions,
  visible: boolean,
  className?: string,
  hasMore: boolean,
  isLoading: boolean,
  hasError: boolean,
  retry: () => void,
  shouldDisplayPictures: boolean,
  proposalInAZoneRequired: boolean,
  dispatch: Dispatch,
  projectType: ?string,
  proposalForm: ProposalLeafletMap_proposalForm,
  isCollectStep?: boolean,
|};

const goToPosition = (mapRef: MapRef, address: ?MapCenterObject) =>
  mapRef.current?.panTo([address?.lat || 0, address?.lng || 0]);

const locationIcon = L.divIcon({
  className: 'leaflet-control-locate-location',
  html: locationMarkerCode,
  iconSize: [48, 48],
});

let locationMarker: typeof L.Marker = {};

const flyToPosition = (mapRef: MapRef, lat: number, lng: number) => {
  if (mapRef.current) {
    mapRef.current.removeLayer(locationMarker);
  }
  if (mapRef.current) {
    mapRef.current.flyTo([lat, lng], 18);
  }
  locationMarker = L.marker([lat, lng], { icon: locationIcon }).addTo(mapRef.current);
};

let lastPopoverLatLng = { lat: 0, lng: 0 };
const openPopup = (
  mapRef: MapRef,
  popupRef: PopupRef,
  latlng?: MapCenterObject,
  geoJsons,
  proposalInAZoneRequired: boolean,
) => {
  if (!latlng) return;
  if (proposalInAZoneRequired && !geoContains(geoJsons || [], latlng)) {
    mapToast();
    return;
  }
  lastPopoverLatLng = latlng;
  if (popupRef.current) {
    popupRef.current.setLatLng(latlng).openOn(mapRef.current);
  }
};

const closePopup = (mapRef: MapRef, popupRef: PopupRef) => {
  if (popupRef.current) popupRef.current._close();
};

const settingsSlider = {
  dots: false,
  infinite: true,
  speed: 500,
  centerPadding: '30px',
  centerMode: true,
  arrows: false,
};

let isOnCluster = false;
// WARNING : Due to the use of global variables this component is for now a one-time use
export const ProposalLeafletMap = ({
  geoJsons,
  defaultMapOptions,
  proposals,
  visible,
  mapTokens,
  className,
  hasMore,
  hasError,
  retry,
  dispatch,
  shouldDisplayPictures,
  proposalInAZoneRequired,
  projectType,
  proposalForm,
  isCollectStep,
}: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure(false);
  const intl = useIntl();
  const titleTradKey =
    proposalForm?.objectType === 'ESTABLISHMENT'
      ? getProposalLabelByType(projectType, 'add-establishment')
      : proposalForm?.objectType === 'PROPOSAL'
      ? getProposalLabelByType(projectType, 'add')
      : 'submit-a-question';
  const { publicToken, styleId, styleOwner } = mapTokens.MAPBOX;
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const slickRef = useRef(null);
  const markerRef = useRef(null);
  const [isMobileSliderOpen, setIsMobileSliderOpen] = useState(false);
  const [initialSlide, setInitialSlide] = useState<number | null>(null);
  const [address, setAddress] = useState(null);
  const { width } = useResize();
  const isMobile = width < bootstrapGrid.smMin;
  const [showDiscoverPane, setShowDiscoverPane] = useState(isCollectStep || false);
  const markers = proposals.filter(
    proposal => !!(proposal.address && proposal.address.lat && proposal.address.lng),
  );
  useEffect(() => {
    L.Map.addInitHook('addHandler', 'gestureHandling', GestureHandling);
  }, []);

  useEffect(() => {
    Emitter.on(MapEvents.OpenPopupOnMap, (addr: MapCenterObject) => {
      closePopup(mapRef, popupRef);
      goToPosition(mapRef, addr);
      if (isMobile) {
        setInitialSlide(0);
        setIsMobileSliderOpen(true);
      } else if (markerRef.current) {
        markerRef.current.fire('click');
      }
    });

    return () => {
      Emitter.removeAllListeners(MapEvents.OpenPopupOnMap);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <MapContainer isMobile={isMobile}>
      <ProposalCreateModal
        title={titleTradKey}
        proposalForm={proposalForm}
        show={isOpen}
        onClose={onClose}
        onOpen={async () => {
          const geoAddr = await getAddressFromLatLng(lastPopoverLatLng);
          dispatch(change(formName, 'address', geoAddr ? JSON.stringify([geoAddr]) : geoAddr));
          dispatch(change(formName, 'addressText', geoAddr ? geoAddr.formatted_address : geoAddr));
        }}
      />
      <Address
        id="address"
        getPosition={(lat, lng) => flyToPosition(mapRef, lat, lng)}
        getAddress={(addr: ?AddressComplete) =>
          addr
            ? flyToPosition(mapRef, addr.geometry.location.lat, addr.geometry.location.lng)
            : noop()
        }
        debounce={1200}
        value={address}
        onChange={setAddress}
        placeholder={intl.formatMessage({ id: 'proposal.map.form.placeholder' })}
      />
      <StyledMap
        whenCreated={(map: MapProps) => {
          mapRef.current = map;
          map.on('click', (e: ?{ ...?Event, latlng: MapCenterObject }) => {
            if (isCollectStep)
              openPopup(mapRef, popupRef, e?.latlng, geoJsons, proposalInAZoneRequired);
            setIsMobileSliderOpen(false);
            isOnCluster = false;
            setShowDiscoverPane(false);
          });
          map.on('zoomstart', () => {
            closePopup(mapRef, popupRef);
            setIsMobileSliderOpen(false);
            isOnCluster = false;
            setShowDiscoverPane(false);
          });
        }}
        center={defaultMapOptions.center}
        zoom={defaultMapOptions.zoom}
        maxZoom={MAX_MAP_ZOOM}
        style={{
          height: isMobile ? '100vw' : '50vw',
          // We don't want the map to be bigger than the screen
          maxHeight: isMobile ? '' : 'calc(100vh - 70px)',
          zIndex: 0,
        }}
        zoomControl={false}
        dragging={!L.Browser.mobile}
        tap={false}
        className={className}
        doubleClickZoom={false}
        gestureHandling={!isSafari}>
        <TileLayer
          attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/#/-74.5/40/10">Improve this map</a>'
          url={`https://api.mapbox.com/styles/v1/${styleOwner}/${styleId}/tiles/256/{z}/{x}/{y}?access_token=${publicToken}`}
        />
        <Popup
          ref={popupRef}
          key="popup-proposal"
          closeButton={false}
          position={lastPopoverLatLng}
          autoPan={false}
          className="popup-proposal">
          <LoginOverlay placement="top">
            <Button
              variant="primary"
              variantColor="primary"
              variantSize="small"
              onClick={onOpen}
              disabled={!proposalForm?.contribuable}>
              {intl.formatMessage({ id: titleTradKey })}
            </Button>
          </LoginOverlay>
        </Popup>
        <MarkerClusterGroup
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
          zoomToBoundsOnClick
          onClick={e => {
            if (isCollectStep) {
              if (isOnCluster)
                openPopup(mapRef, popupRef, e.latlng, geoJsons, proposalInAZoneRequired);
              else closePopup(mapRef, popupRef);
            }
            isOnCluster = true;
            setShowDiscoverPane(false);
          }}
          spiderfyDistanceMultiplier={4}
          maxClusterRadius={30}>
          {markers?.length > 0 &&
            markers.map((mark, idx) => {
              const size = idx === initialSlide ? OPENED_MARKER_SIZE : CLOSED_MARKER_SIZE;
              const icon = shouldDisplayPictures ? mark.category?.icon : null;
              const color = shouldDisplayPictures ? mark.category?.color || '#1E88E5' : '#1E88E5';
              return (
                <Marker
                  key={idx}
                  ref={!idx ? markerRef : null}
                  position={[mark.address?.lat, mark.address?.lng]}
                  alt={`marker-${idx}`}
                  icon={L.divIcon({
                    className: 'preview-icn',
                    html: renderToString(
                      <>
                        <Icon name={ICON_NAME.pin3} size={40} color={color} />
                        {icon && <Icon name={ICON_NAME[icon]} size={16} color={colors.white} />}
                      </>,
                    ),
                    iconSize: [size, size],
                    iconAnchor: [size / 2, size],
                    popupAnchor: [0, -size],
                  })}
                  eventHandlers={{
                    click: e => {
                      closePopup(mapRef, popupRef);
                      setShowDiscoverPane(false);
                      const isMarkerOpen: boolean = e.target.isPopupOpen();
                      if (!isOnCluster || isMobile) {
                        setInitialSlide(isMarkerOpen ? idx : null);
                        setIsMobileSliderOpen(isMarkerOpen);
                        if (isMobile) {
                          goToPosition(mapRef, markers[idx].address);
                          if (slickRef?.current) slickRef.current.slickGoTo(idx);
                        }
                      }
                    },
                  }}>
                  <BlankPopup closeButton={false} key="popup-info" autoClose={false}>
                    <ProposalMapPopover proposal={mark} />
                  </BlankPopup>
                </Marker>
              );
            })}
        </MarkerClusterGroup>
        {geoJsons &&
          geoJsons.map((geoJson, idx) => (
            <GeoJSON
              style={convertToGeoJsonStyle(geoJson.style)}
              key={idx}
              data={geoJson.district}
            />
          ))}
        {!isMobile && <ZoomControl position="bottomright" />}
        {hasMore && <ProposalMapLoaderPane hasError={hasError} retry={retry} />}
        <ProposalMapDiscoverPane
          show={showDiscoverPane}
          handleClose={() => setShowDiscoverPane(false)}
        />
        <ProposalMapOutOfAreaPane
          content={intl.formatHTMLMessage({ id: 'constraints.address_in_zone' })}
        />
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
  shouldDisplayPictures: state.default.features.display_pictures_in_depository_proposals_list,
});

const container = connect<any, any, _, _, _, _>(mapStateToProps)(ProposalLeafletMap);

export default createFragmentContainer(container, {
  proposalForm: graphql`
    fragment ProposalLeafletMap_proposalForm on ProposalForm {
      objectType
      contribuable
      ...ProposalCreateModal_proposalForm
    }
  `,
  proposals: graphql`
    fragment ProposalLeafletMap_proposals on Proposal @relay(plural: true) {
      address {
        lat
        lng
      }
      ...ProposalMapPopover_proposal
      category {
        color
        icon
      }
      id
    }
  `,
});
