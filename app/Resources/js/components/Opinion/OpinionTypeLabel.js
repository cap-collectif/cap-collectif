// @flow
import * as React from 'react';
import { Label } from 'react-bootstrap';

type Props = { type: { title: string } };

export default class OpinionTypeLabel extends React.Component<Props> {
  render() {
    const { type } = this.props;
    return <Label>{type.title}</Label>;
  }
}
