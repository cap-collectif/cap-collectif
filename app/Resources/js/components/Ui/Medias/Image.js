// @flow
import React, { PureComponent } from 'react';
import styled, { type StyledComponent } from 'styled-components';
import config, { baseUrl } from '../../../config';

type Props = {
  width: string,
  height: string,
  objectFit: string,
  alt: string,
  src: ?string,
  className?: string,
  fallBack?: string,
  onError?: () => {},
};

type State = {|
  noImageAvailable: boolean,
|};

export const Container: StyledComponent<Props, {}, HTMLImageElement> = styled.img`
  width: ${props => props.width};
  height: ${props => props.height};
  object-fit: ${props => props.objectFit};
`;

const myFallBack = `${baseUrl}/svg/fallbackDev.svg`;

export class Image extends PureComponent<Props, State> {
  static defaultProps = {
    objectFit: 'cover',
    width: 'auto',
    height: 'auto',
    alt: '',
  };

  constructor(props: Props) {
    super(props);
    this.state = { noImageAvailable: !this.props.src };
  }

  handleError = () => {
    this.setState({ noImageAvailable: true });
  };

  render() {
    const { width, height, objectFit, alt, src, className, fallBack } = this.props;
    const { noImageAvailable } = this.state;

    const shownFallBack = !fallBack && config.isDev ? myFallBack : fallBack;

    return (
      <Container
        className={className}
        src={noImageAvailable ? shownFallBack : src}
        onError={this.handleError}
        width={width}
        height={height}
        objectFit={objectFit}
        alt={alt}
      />
    );
  }
}

export default Image;
