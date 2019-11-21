// @flow
import React, { Component } from 'react';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import { connect } from 'react-redux';
import { fetchQuery, graphql } from 'relay-runtime';
import { FormattedMessage } from 'react-intl';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';
import LocateControl from '../../Proposal/Map/LocateControl';
import LeafletSearch from '../../Proposal/Map/LeafletSearch';
import type { GlobalState, Dispatch } from '../../../types';
import { changeEventSelected } from '../../../redux/modules/event';
import type { MapTokens } from '../../../redux/modules/user';
import type { MapOptions } from '../../Proposal/Map/ProposalLeafletMap';
import environment from '../../../createRelayEnvironment';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import { UserAvatar } from '../../User/UserAvatar';
import type { UserAvatar_user } from '~relay/UserAvatar_user.graphql';

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
    author: ?UserAvatar_user,
    googleMapsAddress: ?{
      formatted: string,
    },
    title: string,
    url: string,
  },
|};

const eventMapPreviewQuery = graphql`
  query LeafletMapQuery($id: ID!) {
    node(id: $id) {
      ... on Event {
        id
        title
        url
        googleMapsAddress {
          formatted
        }
        title
        author {
          ...UserAvatar_user
        }
      }
    }
  }
`;

export class LeafletMap extends Component<Props, State> {
  eventsViewed = [];

  static defaultProps = {
    markers: '',
    loading: false,
    defaultMapOptions: {
      center: { lat: 48.8586047, lng: 2.3137325 },
      zoom: 10,
    },
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      currentEvent: null,
    };
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
    const { dispatch } = this.props;
    const { currentEvent } = this.state;
    const currentMarkerId = marker.id;
    dispatch(changeEventSelected(currentMarkerId));

    // load from local cache
    if (typeof this.eventsViewed[currentMarkerId] !== 'undefined') {
      this.setState({ currentEvent: this.eventsViewed[currentMarkerId] });
    } else if (
      currentEvent === null ||
      typeof currentEvent !== 'undefined' ||
      (currentEvent && currentEvent.id) !== currentMarkerId
    ) {
      fetchQuery(environment, eventMapPreviewQuery, { id: currentMarkerId }).then(data => {
        // add it in local cache
        this.eventsViewed[data.node.id] = data.node;
        this.setState({ currentEvent: data.node });
      });
    }
  };

  render() {
    const { loading, markers, defaultMapOptions, eventSelected, mapTokens, dispatch } = this.props;
    const { currentEvent } = this.state;
    const { publicToken, styleId, styleOwner } = mapTokens.MAPBOX;

    const markersGroup = [];
    if (markers && markers.edges && markers.edges.length > 0) {
      markers.edges
        .filter(Boolean)
        .map(edge => edge.node)
        .filter(Boolean)
        .map(marker => {
          if (marker.googleMapsAddress) {
            markersGroup.push(L.latLng(marker.googleMapsAddress.lat, marker.googleMapsAddress.lng));
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
            onPopupClose={() => {
              dispatch(changeEventSelected(null));
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
                  marker.googleMapsAddress ? (
                    <Marker
                      key={marker.id}
                      // That's not how it's supposed to be done, see https://github.com/YUzhva/react-leaflet-markercluster/issues/91
                      onClick={() => this.handleMarkersClick(marker)}
                      position={[marker.googleMapsAddress.lat, marker.googleMapsAddress.lng]}
                      icon={this.getMarkerIcon(marker)}>
                      <Popup
                        autoPanPadding={[50, 50]}
                        maxWidth={200}
                        className={
                          eventSelected && eventSelected === marker.id
                            ? 'event-map-popup'
                            : 'popup-hidden'
                        }>
                        {currentEvent && currentEvent.id === marker.id ? (
                          <div>
                            <h2>
                              <a href={currentEvent.url}>{currentEvent.title}</a>
                            </h2>
                            {currentEvent.author && currentEvent.author.username && (
                              <p className="excerpt">
                                <UserAvatar
                                  size={16}
                                  className="mr-10"
                                  user={currentEvent.author}
                                />
                                <span className="font-weight-semi-bold">
                                  {currentEvent.author.username}
                                </span>
                              </p>
                            )}
                            {currentEvent.googleMapsAddress && (
                              <p className="excerpt">
                                <i className="cap-marker-1 mr-10" />
                                {currentEvent.googleMapsAddress.formatted}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <Loader />
                          </div>
                        )}
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
