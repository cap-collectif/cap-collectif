// @flow
import * as React from 'react';
import Icon, { ICON_NAME } from './Icon';

type Props = {
  name: $Values<typeof ICON_NAME>,
  className?: string,
};

const SocialIcon = ({ className, name, ...rest }: Props) => (
  <span className={className}>
    <Icon name={name} {...rest} />
  </span>
);

export default SocialIcon;
