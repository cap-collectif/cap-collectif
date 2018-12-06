// @flow
import React, { PureComponent } from 'react';
import { Media as MediaBtsp } from 'react-bootstrap';

type Props = {
  children?: any,
};

export default class Body extends PureComponent<Props> {
  render() {
    const { children } = this.props;

    return <MediaBtsp.Body>{children}</MediaBtsp.Body>;
  }
}
