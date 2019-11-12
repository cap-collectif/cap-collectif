// @flow
import React, { PureComponent } from 'react';
import styled, { type StyledComponent } from 'styled-components';

type Props = {
  children: any,
  ratioX: number,
  ratioY: number,
};

export const Container: StyledComponent<Props, {}, HTMLDivElement> = styled.div.attrs({
  className: 'ratio-media-container',
})`
  position: relative;
  overflow: hidden;

  &:before {
    display: block;
    content: ' ';
    width: 100%;
    padding-top: ${props => `${(props.ratioY / props.ratioX) * 100}%`};
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

export class RatioMediaContainer extends PureComponent<Props> {
  static defaultProps = {
    ratioX: 16,
    ratioY: 9,
  };

  render() {
    const { children, ratioX, ratioY } = this.props;

    return (
      <Container ratioX={ratioX} ratioY={ratioY}>
        <div className="ratio-media-container__content">{children}</div>
      </Container>
    );
  }
}

export default RatioMediaContainer;
