// @flow
import React, { Component } from 'react';
import { Map, TileLayer, GeoJSON } from 'react-leaflet-universal';
import { connect, type MapStateToProps, type Connector } from 'react-redux';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import LocateControl from './LocateControl';
import LeafletSearch from './LeafletSearch';
import { loadMarkers } from '../../../redux/modules/proposal';
import config from '../../../config';
import type { Dispatch, State } from '../../../types';

type MapCenterObject = {
  lat: number,
  lng: number,
};

type MapOptions = {
  center: MapCenterObject,
  zoom: number,
};

type ComponentState = {
  loaded: boolean,
};

type GeoJson = {
  style: string,
  district: string,
};

type Props = {
  markers: ?Object,
  geoJsons?: Array<GeoJson>,
  defaultMapOptions: MapOptions,
  visible: boolean,
  stepId: string,
  stepType: string,
  dispatch: Dispatch,
};

type DefaultProps = {
  defaultMapOptions: MapOptions,
  visible: boolean,
};

let L;

export class LeafletMap extends Component<Props, ComponentState> {
  static defaultProps = {
    markers: null,
    defaultMapOptions: {
      center: { lat: 48.8586047, lng: 2.3137325 },
      zoom: 12,
    },
    visible: true,
  };

  static getStringPopup(marker: Object): string {
    return `
        <h2 class="h4 proposal__title">
          <a href="${marker.url}">${marker.title}</a>
        </h2>
        Par : <a href="${marker.author.url}">${marker.author.username}</a>
      `;
  }

  constructor() {
    super();
    this.state = { loaded: false };
  }

  state: ComponentState;

  componentDidMount() {
    // This import is used to avoid SSR errors.
    L = require('leaflet'); // eslint-disable-line
    this.setState({ loaded: true }); // eslint-disable-line

    const { dispatch, stepId, stepType, visible } = this.props;
    if (visible) {
      dispatch(loadMarkers(stepId, stepType));
    }
  }

  // $FlowFixMe
  componentDidUpdate(prevProps) {
    const { dispatch, stepId, stepType, visible } = this.props;
    if (visible && prevProps.visible !== visible) {
      dispatch(loadMarkers(stepId, stepType));
    }
  }

  render() {
    const { geoJsons, defaultMapOptions, markers, visible } = this.props;

    if (!visible || !this.state.loaded) {
      return null;
    }

    const token = config.mapboxApiKey;

    const defaultDistrictStyle = {
      color: '#ff0000',
      weight: 1,
      opacity: 0.3,
    };

    const markersList =
      markers && markers.length > 0
        ? markers.map(mark => ({
            lat: mark.lat,
            lng: mark.lng,
            popup: LeafletMap.getStringPopup(mark),
            options: {
              icon: L.icon({
                iconUrl: '/svg/marker.svg',
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -40],
              }),
            },
          }))
        : [];

    return (
      <Map
        center={defaultMapOptions.center}
        zoom={defaultMapOptions.zoom}
        maxZoom={18}
        style={{
          width: '100%',
          height: '50vw',
        }}>
        <TileLayer
          attribution="&copy; <a href&quot;https://www.mapbox.com/about/maps/&quot;>Mapbox</a> &copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> <a href&quot;https://www.mapbox.com/map-feedback/#/-74.5/40/10&quot;>Improve this map</a>"
          url={`https://api.mapbox.com/styles/v1/capcollectif/cj4zmeym20uhr2smcmgbf49cz/tiles/256/{z}/{x}/{y}?access_token=${token}`}
        />
        <MarkerClusterGroup
          wrapperOptions={{ enableDefaultStyle: true }}
          options={{
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            maxClusterRadius: 30,
          }}
          markers={markersList}
        />
        {geoJsons &&
          geoJsons.map((geoJson, key) => (
            <GeoJSON
              style={geoJson.style ? JSON.parse(geoJson.style) : defaultDistrictStyle}
              key={key}
              data={geoJson.district}
            />
          ))}
        <LocateControl />
        <LeafletSearch />
      </Map>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  markers: state.proposal.markers || {},
  stepId: state.project.currentProjectStepById || '',
  stepType:
    state.project.projectsById[state.project.currentProjectById || ''].stepsById[
      state.project.currentProjectStepById
    ].type,
});

const connector: Connector<DefaultProps, Props> = connect(mapStateToProps);

export default connector(LeafletMap);
