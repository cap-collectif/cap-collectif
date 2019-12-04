// @flow
import React, { PureComponent } from 'react';
import styled, { type StyledComponent } from 'styled-components';

type Props = {
  children?: any,
  url: string,
  width: string,
  height: string,
  linearGradient: boolean,
  role?: string,
  alt?: string,
};

export const Container: StyledComponent<Props, {}, HTMLDivElement> = styled.div.attrs({
  className: 'darken-gradient-media',
})`
  background: ${props =>
    props.linearGradient
      ? `linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0)),
  url(${props.url})`
      : `url(${props.url})`};
  background-repeat: no-repeat;
  background-size: cover;
  width: ${props => props.width};
  height: ${props => props.height};
`;

export class DarkenGradientMedia extends PureComponent<Props> {
  static defaultProps = {
    linearGradient: true,
    width: '100%',
    height: '100%',
  };

  render() {
    const { url, width, height, linearGradient, alt, children, role } = this.props;

    return (
      <Container
        url={url}
        width={width}
        height={height}
        linearGradient={linearGradient}
        role={role}
        aria-label={alt}>
        {children}
      </Container>
    );
  }
}

export default DarkenGradientMedia;
