// @flow
import * as React from 'react';

import Icon from './Icon';
import { socialColors } from '../../../utils/colors';

type Props = {
  action: string,
};



// const SocialIcon = ({ name, ...rest }: Props) => (
//   <span style={{ color: socialColors[name] }}>
//     <Icon name={iconClass} {...rest} />
//   </span>
// );

class SocialIcon extends React.Component<Props> {
  render() {
    const { action, ...rest } = this.props;


    return (
      <span style={{ color: socialColors[action] }}>
        <Icon name={action} {...rest} />
      </span>
    );
  }
}

export default SocialIcon;
