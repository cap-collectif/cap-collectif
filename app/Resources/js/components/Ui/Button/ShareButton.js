// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { DropdownButton } from 'react-bootstrap';

import SocialIcon from '../Icons/SocialIcon';

type Props = {|
  id: string,
  children: any,
  bsSize?: string,
  className: string,
  outline?: boolean,
  grey?: boolean,
  margin: string,
  onClick?: Function,
|};

class ShareButton extends React.Component<Props> {
  static defaultProps = {
    className: '',
    margin: '',
    onClick: () => {},
  };

  render() {
    const { id, children, bsSize, className, outline, grey, margin, onClick } = this.props;
    const greyClass = grey ? 'btn-dark-gray' : '';
    const outlineClass = outline ? 'btn--outline' : '';

    return (
      <div className={`share-button-dropdown ${margin}`}>
        <DropdownButton
          id={id}
          key={id}
          className={`dropdown--custom ${className} ${greyClass} ${outlineClass}`}
          onClick={onClick}
          bsSize={bsSize}
          title={
            <span>
              <SocialIcon name="share" size={bsSize === 'xs' ? 12 : 16} />{' '}
              {<FormattedMessage id="global.share" />}
            </span>
          }>
          {children}
        </DropdownButton>
      </div>
    );
  }
}

export default ShareButton;
