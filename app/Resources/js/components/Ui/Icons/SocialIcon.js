// @flow
import * as React from 'react';
import Icon from './Icon';

type Props = {
  name: string,
  className?: string,
};

class SocialIcon extends React.Component<Props> {
  render() {
    const { className, name, ...rest } = this.props;

    return (
      <span className={className}>
        <Icon name={name} {...rest} />
      </span>
    );
  }
}

export default SocialIcon;
