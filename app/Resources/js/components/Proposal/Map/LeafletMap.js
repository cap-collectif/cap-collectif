// @flow
import React, {Component} from 'react';
import {Map, TileLayer, GeoJSON, Marker, Popup} from 'react-leaflet-universal';
import {connect} from 'react-redux';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import LocateControl from './LocateControl';
import LeafletSearch from './LeafletSearch';
import type {State} from '../../../types';
import type {MapTokens} from '../../../redux/modules/user';

type MapCenterObject = {
  lat: number,
  lng: number,
};

export type MapOptions = {
  center: MapCenterObject,
  zoom: number,
};

export type ProposalMapMarker = {|
  +lat: number,
  +lng: number,
  +url: string,
  +title: string,
  +author: {|
    +username: string,
    +url: string
  |}
|}

type ComponentState = {
  loaded: boolean,
};

type Style = {
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
};

export type GeoJson = {|
  district: string,
  style: Style,
|};

type Props = {|
  markers: $ReadOnlyArray<ProposalMapMarker>,
  mapTokens: MapTokens,
  geoJsons?: Array<GeoJson>,
  defaultMapOptions: MapOptions,
  visible: boolean,
  stepId: string,
  stepType: string,
  className?: string,
|};

let L;

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

export class LeafletMap extends Component<Props, ComponentState> {
  static defaultProps = {
    markers: [],
    defaultMapOptions: {
      center: {lat: 48.8586047, lng: 2.3137325},
      zoom: 12,
    },
    visible: true,
  };

  constructor() {
    super();
    this.state = {loaded: false};
  }

  state: ComponentState;

  componentDidMount() {
    // This import is used to avoid SSR errors.
    L = require('leaflet'); // eslint-disable-line
    this.setState({loaded: true});
  }

  render() {
    const {geoJsons, defaultMapOptions, markers, visible, mapTokens, className} = this.props;
    const {loaded} = this.state;
    const {publicToken, styleId, styleOwner} = mapTokens.MAPBOX;

    if (!visible || !loaded) {
      return null;
    }

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
              position={[mark.lat, mark.lng]}
              icon={L.icon({
                iconUrl: '/svg/marker.svg',
                iconSize: [40, 40],
                iconAnchor: [20, 40],
                popupAnchor: [0, -40],
              })}>
              <Popup>
                <div>
                  <h2 className="h4 proposal__title">
                    <a href={mark.url}>{mark.title}</a>
                  </h2>{' '}
                  Par : <a href={mark.author.url}>{mark.author.username}</a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
        {geoJsons &&
        geoJsons.map((geoJson, key) => (
          <GeoJSON
            style={convertToGeoJsonStyle(geoJson.style)}
            key={key}
            data={geoJson.district}
          />
        ))}
        <LocateControl/>
        <LeafletSearch/>
      </Map>
    );
  }
}

const mapStateToProps = (state: State) => ({
  mapTokens: state.user.mapTokens,
  stepId: state.project.currentProjectStepById || '',
  stepType:
    state.project.projectsById[state.project.currentProjectById || ''].stepsById[
      state.project.currentProjectStepById
    ].type,
});

const container = connect(mapStateToProps)(LeafletMap);

export default container;
