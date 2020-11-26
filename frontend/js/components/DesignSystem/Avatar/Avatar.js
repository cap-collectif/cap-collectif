// @flow
import * as React from 'react';
import ColorHash from 'color-hash';
import { variant } from 'styled-system';
import styled from 'styled-components';
import { colorContrast } from '~/utils/colorContrast';
import AppBox from '~ui/Primitives/AppBox';
import Flex from '~ui/Primitives/Layout/Flex';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';

const hash = new ColorHash();

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type AvatarProps = {|
  +name?: string,
  +src?: string,
  +alt?: string,
|};

type Props = {|
  ...AppBoxProps,
  +children?: React.Node,
  +size?: AvatarSize,
  ...AvatarProps,
|};

const getInitials = (name: string, showLastname = false): string => {
  const [firstName, lastName] = name.split(' ');

  if (showLastname === false) {
    return firstName.charAt(0);
  }
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  }

  return firstName.charAt(0);
};

// $FlowFixMe at this point I've lost hope about flow understanding something
const AvatarInner = styled(Flex).attrs({
  borderRadius: '100%',
  overflow: 'hidden',
  align: 'center',
  justify: 'center',
  fontFamily: 'openSans',
  fontWeight: 600,
})(
  // $FlowFixMe
  {
    userSelect: 'none',
  },
  variant({
    variants: {
      xs: {
        fontSize: 1,
        lineHeight: 's',
        size: 4,
        minWidth: 4,
        minHeight: 4,
        maxWidth: 4,
        maxHeight: 4,
      },
      sm: {
        fontSize: 3,
        lineHeight: 'base',
        size: 6,
        minWidth: 6,
        minHeight: 6,
        maxWidth: 6,
        maxHeight: 6,
      },
      md: {
        fontSize: 4,
        lineHeight: 'base',
        size: 8,
        minWidth: 8,
        minHeight: 8,
        maxWidth: 8,
        maxHeight: 8,
      },
      lg: {
        fontSize: 4,
        lineHeight: 'base',
        size: 9,
        minWidth: 9,
        minHeight: 9,
        maxWidth: 9,
        maxHeight: 9,
      },
      xl: {
        fontSize: 6,
        lineHeight: 'l',
        size: 13,
        minWidth: 13,
        minHeight: 13,
        maxWidth: 13,
        maxHeight: 13,
      },
    },
  }),
);

export const Avatar = ({
  name,
  src,
  alt,
  children,
  bg,
  backgroundColor,
  color,
  size = 'md',
  ...props
}: Props) => {
  const shouldDisplayName = src === null || src === undefined;
  const background = hash.hex(name);
  const computedColor = colorContrast(background);

  return (
    <AvatarInner
      style={{
        background: !bg && !backgroundColor ? background : undefined,
        color: !color ? computedColor : undefined,
      }}
      {...{
        ...(shouldDisplayName ? { title: alt ?? name } : {}),
        ...(bg ? { bg } : {}),
        ...(backgroundColor ? { backgroundColor } : {}),
        ...(color ? { color } : {}),
        ...props,
      }}
      variant={size}>
      {shouldDisplayName && children}
      {shouldDisplayName && !children && getInitials(name)}
      {!shouldDisplayName && (
        <AppBox
          as="img"
          width="100%"
          height="100%"
          css={{ objectFit: 'cover' }}
          src={src}
          alt={alt ?? name}
          title={alt ?? name}
        />
      )}
    </AvatarInner>
  );
};

export default Avatar;
