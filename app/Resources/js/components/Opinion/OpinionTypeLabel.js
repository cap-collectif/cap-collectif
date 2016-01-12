import React from 'react';
import {Label} from 'react-bootstrap';

export default class OpinionTypeLabel extends React.Component {

  render() {
    return <Label>{this.props.type.title}</Label>;
  }
}

OpinionTypeLabel.propTypes = { type: React.PropTypes.object.isRequired };
