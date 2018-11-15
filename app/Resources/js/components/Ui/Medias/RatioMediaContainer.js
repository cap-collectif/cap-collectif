// @flow
import React, { PureComponent } from 'react';
import styled from 'styled-components';

type Props = {
  children: any,
  width?: number,
  height?: number,
};

export const Container = styled.div.attrs({
  className: 'ratio-media-container',
})`
  position: relative;
  overflow: hidden;

  &:before {
    display: block;
    content: ' ';
    width: 100%;
    padding-top: ${props => (props.height / props.width) * 100}%;
  }

  .ratio-media-container__content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    img {
      object-fit: cover;
    }

    img,
    .bg--default {
      width: 100%;
      height: 100%;
    }
  }
`;

export default class RatioMediaContainer extends PureComponent<Props> {
  static defaultProps = {
    width: 16,
    height: 9,
  };

  render() {
    const { children, width, height } = this.props;

    return (
      <Container width={width} height={height}>
        <div className="ratio-media-container__content">{children}</div>
      </Container>
    );
  }
}
