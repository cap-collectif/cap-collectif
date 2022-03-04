// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import SocialIcon from '../Icons/SocialIcon';
import Menu from '~ds/Menu/Menu';

type Props = {|
  action: 'facebook' | 'twitter' | 'linkedin' | 'mail' | 'link',
  onSelect?: () => void,
|};

class ShareButtonActionLegacy extends React.Component<Props> {
  render() {
    const { action, onSelect } = this.props;

    return (
      <Menu.ListItem className="share-option" onClick={onSelect}>
        <SocialIcon name={action} size={16} /> <FormattedMessage id={`share.${action}`} />
      </Menu.ListItem>
    );
  }
}

export default ShareButtonActionLegacy;
