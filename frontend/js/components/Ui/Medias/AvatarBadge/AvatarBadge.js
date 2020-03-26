// @flow
import * as React from 'react';
import Avatar, { type Props as AvatarProps } from '~ui/Medias/Avatar';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import AvatarBadgeContainer, { Circle } from '~ui/Medias/AvatarBadge/AvatarBadge.style';

type Props = {
  ...AvatarProps,
  color: string,
  icon: $Values<typeof ICON_NAME>,
  badgeSize: number,
};

const AvatarBadge = ({ src, alt, size, color, icon, badgeSize }: Props) => (
  <AvatarBadgeContainer>
    <Avatar src={src} alt={alt} size={size} />
    <Circle color={color} size={badgeSize}>
      <Icon name={icon} size={10} />
    </Circle>
  </AvatarBadgeContainer>
);

export default AvatarBadge;
