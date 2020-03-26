// @flow
import React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import Image from './Image';
import { avatarPx } from '../../../utils/sizes';

export const SIZE: {
  SMALL: 'small',
  NORMAL: 'normal',
  TINY: 'tiny',
} = {
  SMALL: 'small',
  NORMAL: 'normal',
  TINY: 'tiny',
};

export type Props = {
  size: $Values<typeof SIZE> | number,
  className?: string,
  src: string,
  alt: string,
};

export const Container: StyledComponent<{}, {}, typeof Image> = styled(Image).attrs({
  className: 'avatar',
})`
  border-radius: 50%;
`;

export class Avatar extends React.Component<Props> {
  static defaultProps = {
    size: SIZE.NORMAL,
  };

  render() {
    const { size, src, className, alt } = this.props;

    const getSize = typeof size === 'string' ? avatarPx[size] : size;

    return <Container width={getSize} height={getSize} src={src} alt={alt} className={className} />;
  }
}

export default Avatar;
