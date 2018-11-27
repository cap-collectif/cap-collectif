// @flow
import React from 'react';
import styled from 'styled-components';
import Image from './Image';

type Props = {
  size: 'small' | 'normal',
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
    size: 'normal',
  };

  render() {
    const { size, src, className, alt } = this.props;

    const getSize = size === 'normal' ? '45px' : '34px';

    return <Container width={getSize} height={getSize} src={src} alt={alt} className={className} />;
  }
}

export default Avatar;
