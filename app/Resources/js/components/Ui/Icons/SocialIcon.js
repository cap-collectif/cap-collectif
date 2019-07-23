// @flow
import * as React from 'react';

import Icon from './Icon';
import { socialColors } from '../../../utils/colors';

type Props = {
  name: string,
};



// const SocialIcon = ({ name, ...rest }: Props) => (
//   <span style={{ color: socialColors[name] }}>
//     <Icon name={iconClass} {...rest} />
//   </span>
// );

class SocialIcon extends React.Component<Props> {
  render() {
    const { name, ...rest } = this.props;


    return (
      <span style={{ color: socialColors[name] }}>
        <Icon name={name} {...rest} />
      </span>
    );
  }
}

export default SocialIcon;
