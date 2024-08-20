// @ts-nocheck
import * as React from 'react'
import ColorHash from 'color-hash'
import { variant } from 'styled-system'
import styled from 'styled-components'
import { colorContrast } from '@shared/utils/colorContrast'
import Flex from '~ui/Primitives/Layout/Flex'
import type { AppBoxProps } from '~ui/Primitives/AppBox.type'
import Image from '~ui/Primitives/Image'
const hash = new ColorHash()
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type AvatarProps = {
  readonly name?: string | null | undefined
  readonly src?: string | null | undefined
  readonly alt?: string
}
export type Props = AppBoxProps &
  AvatarProps & {
    readonly children?: JSX.Element | JSX.Element[] | string
    readonly size?: AvatarSize
  }

const getInitials = (name?: string | null | undefined, showLastname = false): string => {
  if (!name) return '🥵'
  const [firstName, lastName] = name.split(' ')

  if (showLastname === false) {
    return firstName.charAt(0)
  }

  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  return firstName.charAt(0)
}

const AvatarInner = styled(Flex).attrs({
  borderRadius: '100%',
  overflow: 'hidden',
  align: 'center',
  justify: 'center',
  fontFamily: 'openSans',
  fontWeight: 600,
})(
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
)
export const Avatar = ({ name, src, alt, children, bg, backgroundColor, color, size = 'md', ...props }: Props) => {
  const shouldDisplayName = src === null || src === undefined
  const background = hash.hex(name)
  const computedColor = colorContrast(background)
  return (
    <AvatarInner
      style={{
        background: !bg && !backgroundColor ? background : undefined,
        color: !color ? computedColor : undefined,
      }}
      {...{
        title: shouldDisplayName ? alt ?? name : undefined,
        bg: bg ?? backgroundColor ?? undefined,
        backgroundColor: bg ?? backgroundColor ?? undefined,
        color: color ?? undefined,
        ...props,
      }}
      variant={size}
    >
      {shouldDisplayName && children}
      {shouldDisplayName && !children && getInitials(name)}
      {!shouldDisplayName && (
        <Image
          width="100%"
          height="100%"
          css={{
            objectFit: 'cover',
          }}
          src={src || ''}
          alt={alt ?? name}
          title={alt ?? name}
        />
      )}
    </AvatarInner>
  )
}
export default Avatar
