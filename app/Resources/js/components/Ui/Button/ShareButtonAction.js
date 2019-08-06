// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { MenuItem } from 'react-bootstrap';
import SocialIcon from '../Icons/SocialIcon';

type Props = {|
  action: 'facebook' | 'twitter' | 'linkedin' | 'mail' | 'link',
  onSelect?: () => void,
|};

class ShareButtonAction extends React.Component<Props> {
  render() {
    const { action, onSelect } = this.props;

    return (
      <MenuItem onSelect={onSelect}>
        <SocialIcon name={action} size={16} /> {<FormattedMessage id={`share.${action}`} />}
      </MenuItem>
    );
  }
}

export default ShareButtonAction;
