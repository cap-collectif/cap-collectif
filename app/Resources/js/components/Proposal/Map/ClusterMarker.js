import React, { Component, PropTypes } from 'react';

export class ClusterMarker extends Component {
  render() {
    const { marker } = this.props;

    return <div className="proposal__map--cluster">{marker.numPoints}</div>;
  }
}

ClusterMarker.propTypes = {
  marker: PropTypes.object.isRequired,
};

export default ClusterMarker;
