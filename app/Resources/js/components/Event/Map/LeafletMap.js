// @flow
import React, { Component } from 'react';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet-universal';
import { Provider, connect } from 'react-redux';
import ReactOnRails from 'react-on-rails';
import { IntlProvider } from 'react-intl-redux';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import LocateControl from '../../Proposal/Map/LocateControl';
import LeafletSearch from '../../Proposal/Map/LeafletSearch';
import config from '../../../config';
import DatesInterval from '../../Utils/DatesInterval';
import type { GlobalState, Dispatch } from '../../../types';
import { changeEventSelected } from '../../../redux/modules/event';
import type { MapTokens } from '../../../redux/modules/user';
import type { MapOptions } from '../../Proposal/Map/LeafletMap';

type Props = {|
  markers: Object | '',
  mapTokens: MapTokens,
  defaultMapOptions: MapOptions,
  eventSelected: ?string,
  dispatch: Dispatch,
|};

let L;

export class LeafletMap extends Component<Props> {
  static defaultProps = {
    markers: '',
    defaultMapOptions: {
      center: { lat: 48.8586047, lng: 2.3137325 },
      zoom: 10,
    },
  };

  componentDidMount() {
    // This import is used to avoid SSR errors.
    // eslint-disable-next-line global-require
    L = require('leaflet');
  }

  getMarkerIcon = (marker: Object) => {
    const { eventSelected } = this.props;
    if (eventSelected && eventSelected === marker.id) {
      return L.icon({
        iconUrl: '/svg/marker-red.svg',
        iconSize: [50, 50],
        iconAnchor: [25, 50],
        popupAnchor: [0, -40],
      });
    }
    return L.icon({
      iconUrl: '/svg/marker.svg',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  };

  handleMarkersClick = (marker: Object) => {
    this.props.dispatch(changeEventSelected(marker.options.id.split('_')[1]));
  };

  render() {
    const { markers, defaultMapOptions, eventSelected, mapTokens } = this.props;
    const { publicToken, styleId, styleOwner } = mapTokens.MAPBOX;

    if (config.canUseDOM) {
      L = require('leaflet'); // eslint-disable-line global-require
    }
    const markersGroup = [];
    if (markers && markers.edges && markers.edges.length > 0) {
      markers.edges
        .filter(Boolean)
        .map(edge => edge.node)
        .filter(Boolean)
        .map(marker => {
          if (marker.lat && marker.lng) {
            markersGroup.push(L.latLng(marker.lat, marker.lng));
          }
        });
    }
    const bounds = L.latLngBounds(markersGroup);
    return (
      <div>
        <Map
          bounds={bounds}
          zoom={defaultMapOptions.zoom}
          maxZoom={18}
          id="event-map"
          scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/#/-74.5/40/10">Improve this map</a>'
            url={`https://api.mapbox.com/styles/v1/${styleOwner}/${styleId}/tiles/256/{z}/{x}/{y}?access_token=${publicToken}`}
          />
          <MarkerClusterGroup
            spiderfyOnMaxZoom
            showCoverageOnHover
            zoomToBoundsOnClick
            onMarkerClick={marker => this.handleMarkersClick(marker)}
            maxClusterRadius={30}>
            {markers &&
              markers.edges &&
              markers.edges.length > 0 &&
              markers.edges
                .filter(Boolean)
                .map(edge => edge.node)
                .filter(Boolean)
                .map((marker, key) =>
                  marker.lat && marker.lng ? (
                    <Marker
                      key={key}
                      id={`marker_${marker.id}`}
                      position={[marker.lat, marker.lng]}
                      icon={this.getMarkerIcon(marker)}>
                      <Popup
                        className={
                          eventSelected && eventSelected === marker.id
                            ? 'event-map-popup'
                            : 'popup-hidden'
                        }>
                        {/* We call the provider because react leaflet need it to call DatesInterval  react-leaflet.js.org/docs/en/intro.html#dom-rendering
                            @Todo find an other way to render this without IntlProvider
                          */}
                        <Provider store={ReactOnRails.getStore('appStore')}>
                          <IntlProvider>
                            <div>
                              <h2>
                                <a href={marker.url}>{marker.title}</a>
                              </h2>
                              <p className="excerpt">
                                <i className="cap-calendar-1 mr-10" />
                                <DatesInterval
                                  endAt={marker.endAt}
                                  startAt={marker.startAt}
                                  fullDay
                                />
                              </p>
                              {marker.fullAddress && (
                                <p className="excerpt">
                                  <i className="cap-marker-1 mr-10" />
                                  {marker.fullAddress}
                                </p>
                              )}
                            </div>
                          </IntlProvider>
                        </Provider>
                      </Popup>
                    </Marker>
                  ) : null,
                )}
          </MarkerClusterGroup>
          <LocateControl />
          <LeafletSearch messageSearch="proposal.map.form.field" />
        </Map>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  eventSelected: state.event.eventSelected,
  mapTokens: state.user.mapTokens,
});

export default connect(mapStateToProps)(LeafletMap);
