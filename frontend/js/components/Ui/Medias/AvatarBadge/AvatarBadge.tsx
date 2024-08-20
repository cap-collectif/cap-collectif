import { $Values } from 'utility-types'
import * as React from 'react'
import type { Props as AvatarProps } from '~ui/Medias/Avatar'
import Avatar from '~ui/Medias/Avatar'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import AvatarBadgeContainer, { Circle } from '~ui/Medias/AvatarBadge/AvatarBadge.style'

type Props = AvatarProps & {
  color: string
  icon: $Values<typeof ICON_NAME>
  badgeSize: number
  iconSize: number
  iconColor: string
}

const AvatarBadge = ({ src, alt, size, color, icon, badgeSize, iconSize, iconColor }: Props) => (
  <AvatarBadgeContainer>
    <Avatar src={src} alt={alt} size={size} />
    <Circle color={color} size={badgeSize}>
      <Icon name={icon} size={iconSize} color={iconColor} />
    </Circle>
  </AvatarBadgeContainer>
)

export default AvatarBadge
