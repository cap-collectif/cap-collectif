// @flow
import * as React from 'react';
import { Label } from 'react-bootstrap';

type Props = { type: { title: string } };

export default class OpinionTypeLabel extends React.Component<Props> {
  render() {
    // eslint-disable-next-line react/prop-types
    const { type } = this.props;
    return (
      <Label>
        {type.title}
      </Label>
    );
  }
}
