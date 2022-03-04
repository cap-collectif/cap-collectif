// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Flex, Menu } from '@cap-collectif/ui';
import SocialIcon from '../Icons/SocialIcon';

type Props = {|
  action: 'facebook' | 'twitter' | 'linkedin' | 'mail' | 'link',
  onSelect?: () => void,
|};

class ShareButtonAction extends React.Component<Props> {
  render() {
    const { action, onSelect } = this.props;

    return (
      <Menu.Item
        as="a"
        href="#"
        className="share-option"
        onClick={onSelect}
        style={{ marginBottom: 'unset' }}>
        <Flex>
          <SocialIcon name={action} size={16} />
          <FormattedMessage id={`share.${action}`} />
        </Flex>
      </Menu.Item>
    );
  }
}

export default ShareButtonAction;
