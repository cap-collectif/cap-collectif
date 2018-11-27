// @flow
import React from 'react';
import styled from 'styled-components';
import Image from './Image';

type Props = {
  size: 45 | 34,
  className?: string,
  src: string,
  alt: string,
};

export const Container = styled(Image).attrs({
  className: 'avatar',
})`
  border-radius: 50%;
`;

export class Avatar extends React.Component<Props> {
  static defaultProps = {
    size: 45,
  };

  render() {
    const { size, src, className, alt } = this.props;

    return (
      <Container
        width={`${size}px`}
        height={`${size}px`}
        src={src}
        alt={alt}
        className={className}
      />
    );
  }
}

export default Avatar;
