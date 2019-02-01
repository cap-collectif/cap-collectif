// @flow
import React from 'react';
import styled from 'styled-components';
import Image from './Image';
import { avatarPx } from '../../../utils/sizes';

type Props = {
  size: 'small' | 'normal' | 'tiny',
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

    const getSize = avatarPx[size];

    return <Container width={getSize} height={getSize} src={src} alt={alt} className={className} />;
  }
}

export default Avatar;
