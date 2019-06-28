// @flow
import React, { Component } from 'react';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet-universal';
import { connect } from 'react-redux';
import { fetchQuery, graphql } from 'relay-runtime';
// import ReactOnRails from 'react-on-rails';
// import { IntlProvider } from 'react-intl-redux';
import { FormattedMessage } from 'react-intl';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import LocateControl from '../../Proposal/Map/LocateControl';
import LeafletSearch from '../../Proposal/Map/LeafletSearch';
import config from '../../../config';
// import DatesInterval from '../../Utils/DatesInterval';
import type { GlobalState, Dispatch } from '../../../types';
import { changeEventSelected } from '../../../redux/modules/event';
import type { MapTokens } from '../../../redux/modules/user';
import type { MapOptions } from '../../Proposal/Map/LeafletMap';
import { UserAvatarDeprecated } from '../../User/UserAvatarDeprecated';
import environment from '../../../createRelayEnvironment';
import Loader from '../../Ui/FeedbacksIndicators/Loader';

type Props = {|
  markers: Object | '',
  mapTokens: MapTokens,
  defaultMapOptions: MapOptions,
  eventSelected: ?string,
  dispatch: Dispatch,
  loading: boolean,
|};

type State = {|
  currentEvent: ?{
    id: string,
    author: ?{
      username: string,
      media: ?{
        url: string,
      },
      url: string,
    },
    startAt: string,
    endAt: string,
    fullAddress: string,
    title: string,
    url: string,
  },
|};

let L;

// No alternative to fullAddress for now…
/* eslint-disable graphql/no-deprecated-fields */
const eventMapPreviewQuery = graphql`
  query LeafletMapQuery($id: ID!) {
    node(id: $id) {
      ... on Event {
        id
        title
        url
        fullAddress
        timeRange {
          startAt
          endAt
        }
        title
        author {
          username
          url
          media {
            url
          }
        }
      }
    }
  }
`;

export class LeafletMap extends Component<Props, State> {
  eventsViewed = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      currentEvent: null,
    };
  }

  static defaultProps = {
    markers: '',
    loading: false,
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
    const currentMarkerId = marker.options.id.split('_')[1];
    this.props.dispatch(changeEventSelected(currentMarkerId));

    // load from local cache
    if (typeof this.eventsViewed[currentMarkerId] !== 'undefined') {
      this.setState({ currentEvent: this.eventsViewed[currentMarkerId] });
    } else if (
      this.state.currentEvent === null ||
      typeof this.state.currentEvent !== 'undefined' ||
      (this.state.currentEvent && this.state.currentEvent.id) !== currentMarkerId
    ) {
      fetchQuery(environment, eventMapPreviewQuery, { id: currentMarkerId }).then(data => {
        // add it in local cache
        this.eventsViewed[data.node.id] = data.node;
        this.setState({ currentEvent: data.node });
      });
    }
  };

  render() {
    const { loading, markers, defaultMapOptions, eventSelected, mapTokens } = this.props;
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
      <div style={{ position: 'relative' }}>
        {loading ? (
          <p
            style={{
              position: 'absolute',
              marginLeft: '-50px',
              left: '50%',
              top: '50%',
              color: '#000',
              zIndex: '1500',
            }}>
            <FormattedMessage id="global.loading" />
          </p>
        ) : null}
        <Map
          bounds={bounds.isValid() ? bounds : undefined}
          zoom={defaultMapOptions.zoom}
          maxZoom={18}
          preferCanvas
          id="event-map"
          style={loading ? { WebkitFilter: 'blur(5px)', zIndex: '0' } : { zIndex: '0' }}
          scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> <a href="https://www.mapbox.com/map-feedback/#/-74.5/40/10">Improve this map</a>'
            url={`https://api.mapbox.com/styles/v1/${styleOwner}/${styleId}/tiles/256/{z}/{x}/{y}?access_token=${publicToken}`}
          />
          <MarkerClusterGroup
            spiderfyOnMaxZoom
            showCoverageOnHover={false}
            zoomToBoundsOnClick
            onMarkerClick={marker => this.handleMarkersClick(marker)}
            onPopupClose={() => {
              this.props.dispatch(changeEventSelected(null));
            }}
            maxClusterRadius={30}>
            {markers &&
              markers.edges &&
              markers.edges.length > 0 &&
              markers.edges
                .filter(Boolean)
                .map(edge => edge.node)
                .filter(Boolean)
                .map(marker =>
                  marker.lat && marker.lng ? (
                    <Marker
                      key={marker.id}
                      id={`marker_${marker.id}`}
                      position={[marker.lat, marker.lng]}
                      icon={this.getMarkerIcon(marker)}>
                      <Popup
                        autoPanPadding={[50, 50]}
                        maxWidth={200}
                        className={
                          eventSelected && eventSelected === marker.id
                            ? 'event-map-popup'
                            : 'popup-hidden'
                        }>
                        {/* We call the provider because react leaflet need it to call DatesInterval  react-leaflet.js.org/docs/en/intro.html#dom-rendering
                            @Todo find an other way to render this without IntlProvider
                          */}
                        {/* <Provider store={ReactOnRails.getStore('appStore')}>
                          <IntlProvider> */}
                        {this.state.currentEvent && this.state.currentEvent.id === marker.id ? (
                          <div>
                            <h2>
                              <a href={this.state.currentEvent.url}>
                                {this.state.currentEvent.title}
                              </a>
                            </h2>
                            {this.state.currentEvent.author &&
                              this.state.currentEvent.author.username && (
                                <p className="excerpt">
                                  {/* $FlowFixMe */}
                                  <UserAvatarDeprecated
                                    size={16}
                                    user={this.state.currentEvent.author}
                                  />
                                  <span className="font-weight-semi-bold">
                                    {this.state.currentEvent.author.username}
                                  </span>
                                </p>
                              )}
                            {this.state.currentEvent.fullAddress && (
                              <p className="excerpt">
                                <i className="cap-marker-1 mr-10" />
                                {this.state.currentEvent.fullAddress}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <Loader />
                          </div>
                        )}
                        {/* </IntlProvider>
                        </Provider> */}
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
