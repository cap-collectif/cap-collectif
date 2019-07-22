// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { MenuItem } from 'react-bootstrap';

type Props = {|
  action: 'facebook' | 'twitter' | 'linkedin' | 'mail' | 'link',
  onSelect?: () => void,
|};

class ShareButtonAction extends React.Component<Props> {
  render() {
    const { action, onSelect } = this.props;
    const iconClass =
      action === 'mail'
        ? `cap cap-${action}-2-1`
        : action === 'link'
        ? `cap cap-${action}-1`
        : `cap cap-${action}`;
    return (
      <MenuItem onSelect={onSelect}>
        <i className={iconClass} /> {<FormattedMessage id={`share.${action}`} />}
      </MenuItem>
    );
  }
}

export default ShareButtonAction;
