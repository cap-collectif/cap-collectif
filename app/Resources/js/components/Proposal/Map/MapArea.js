// @flow
import React, { PropTypes } from 'react';
import GoogleMapReact from 'google-map-react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import pointsCluster from 'points-cluster';
import Marker from './Marker';
import ClusterMarker from './ClusterMarker';
import { loadMarkers } from '../../../redux/modules/proposal';
import config from '../../../config';

export const MapArea = React.createClass({
  propTypes: {
    markers: PropTypes.object.isRequired,
    stepId: PropTypes.string.isRequired,
    stepType: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    defaultMapOptions: PropTypes.object.isRequired,
    center: PropTypes.object,
    zoom: PropTypes.number,
    visible: PropTypes.bool,
  },

  getDefaultProps() {
    return {
      markers: [],
      defaultMapOptions: {
        center: { lat: 48.8586047, lng: 2.3137325 },
        zoom: 12,
      },
      visible: true,
    };
  },

  getInitialState() {
    const { defaultMapOptions } = this.props;
    return {
      map: null,
      control: defaultMapOptions,
    };
  },

  componentDidMount() {
    const { dispatch, stepId, stepType } = this.props;
    dispatch(loadMarkers(stepId, stepType));
  },

  zoomTo(zoom: number, newCenter: ?Object = null) {
    this.setState(prevState => ({
      ...prevState,
      control: {
        center: newCenter || prevState.control.center,
        zoom,
      },
    }));
  },

  render() {
    const { defaultMapOptions, visible, markers } = this.props;

    if (!markers) {
      return null;
    }

    const clusters = pointsCluster(
      Object.keys(markers).map(key => {
        return markers[key];
      }),
      {
        minZoom: 3,
        maxZoom: 14,
        radius: 30,
      },
    );

    const generatedMarkers = this.state.map ? clusters(this.state.map) : [];

    const styleHidden = { display: visible ? 'block' : 'none' };

    return (
      <div style={styleHidden}>
        <Row>
          <Col md={12}>
            <GoogleMapReact
              style={{
                zIndex: 999,
                height: 500,
              }}
              onChange={({ center, zoom, bounds }) => {
                this.setState(prevState => ({
                  ...prevState,
                  map: { center, zoom, bounds },
                  control: { center, zoom },
                }));
              }}
              className="proposal__map"
              onChildClick={(markerId, clickedMarker) => {
                if (clickedMarker.marker.numPoints > 1) {
                  this.zoomTo(15, {
                    lat: clickedMarker.lat,
                    lng: clickedMarker.lng,
                  });
                }
              }}
              defaultCenter={defaultMapOptions.center}
              resetBoundsOnResize
              bootstrapURLKeys={{
                key: config.mapsAPIKey,
                language: 'fr',
              }}
              zoom={this.state.control.zoom}
              center={this.state.control.center}
              defaultZoom={12}
              options={maps => ({
                zoomControlOptions: {
                  position: maps.ControlPosition.RIGHT_CENTER,
                  style: maps.ZoomControlStyle.SMALL,
                },
                mapTypeControlOptions: {
                  position: maps.ControlPosition.TOP_RIGHT,
                },
                mapTypeControl: true,
              })}>
              {generatedMarkers.length > 0 &&
                generatedMarkers.map((marker, index) => {
                  if (marker.numPoints > 1) {
                    return (
                      <ClusterMarker
                        key={index}
                        lat={marker.y}
                        lng={marker.x}
                        marker={marker}
                      />
                    );
                  }

                  return (
                    <Marker
                      key={marker.points[0].id}
                      lat={marker.points[0].lat}
                      lng={marker.points[0].lng}
                      marker={marker.points[0]}
                    />
                  );
                })}
            </GoogleMapReact>
          </Col>
        </Row>
      </div>
    );
  },
});

const mapStateToProps = state => ({
  markers: state.proposal.markers,
  stepId: state.project.currentProjectStepById,
  stepType:
    state.project.projectsById[state.project.currentProjectById].stepsById[
      state.project.currentProjectStepById
    ].type,
});

export default connect(mapStateToProps)(MapArea);
