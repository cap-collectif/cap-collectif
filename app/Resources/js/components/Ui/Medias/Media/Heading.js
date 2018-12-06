// @flow
import React, { PureComponent } from 'react';
import { Media as MediaBtsp } from 'react-bootstrap';

type Props = {
  children?: any,
  componentClass?: string,
};

export default class Heading extends PureComponent<Props> {
  render() {
    const { children, componentClass } = this.props;

    return <MediaBtsp.Heading componentClass={componentClass}>{children}</MediaBtsp.Heading>;
  }
}
