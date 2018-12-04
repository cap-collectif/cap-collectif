// @flow
import React, { PureComponent } from 'react';

type Props = {
  children: any,
};

export default class SixteenNineMedia extends PureComponent<Props> {
  render() {
    return (
      <div className="sixteen-nine">
        <div className="content">{this.props.children}</div>
      </div>
    );
  }
}
