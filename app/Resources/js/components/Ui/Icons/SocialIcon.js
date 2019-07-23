// @flow
import * as React from 'react';

import Icon from './Icon';
import { socialColors } from '../../../utils/colors';

type Props = {
  name: string,
};

const SocialIcon = ({ name, ...rest }: Props) => (
  <span style={{ color: socialColors[name] }}>
    <Icon name={name} {...rest} />
  </span>
);

export default SocialIcon;
