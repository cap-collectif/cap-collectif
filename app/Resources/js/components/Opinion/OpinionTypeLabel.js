import React from 'react';
import { Label } from 'react-bootstrap';

export default class OpinionTypeLabel extends React.Component {

  render() {
    const { type } = this.props;
    return <Label>{type.title}</Label>;
  }
}

OpinionTypeLabel.propTypes = { type: React.PropTypes.object.isRequired };
