// @flow
import React, { Component, PropTypes } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';

export class Marker extends Component {
  render() {
    const { marker } = this.props;

    const popOver = (
      <Popover id="popover-positioned-top">
        <h2 className="h4 proposal__title">
          <a href={marker.url}>{marker.title}</a>
        </h2>
        Par : <a href={marker.author.url}>{marker.author.username}</a>
      </Popover>
    );

    return (
      <OverlayTrigger
        trigger="click"
        placement="top"
        rootClose
        overlay={popOver}>
        <img
          src="/svg/marker.svg"
          className="proposal__map--marker"
          alt={`${marker.title} marker`}
        />
      </OverlayTrigger>
    );
  }
}

Marker.propTypes = {
  marker: PropTypes.object.isRequired,
};

export default Marker;
