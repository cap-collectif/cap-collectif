// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { DropdownButton } from 'react-bootstrap';

type Props = {|
  id: string,
  children: any,
  bsSize?: string,
  className: string,
  outline?: boolean,
  grey?: boolean,
  margin: string,
|};

class ShareButton extends React.Component<Props> {
  static defaultProps = {
    className: '',
    margin: '',
  };

  render() {
    const { id, children, bsSize, className, outline, grey, margin } = this.props;
    const greyClass = grey ? 'btn-dark-gray' : '';
    const outlineClass = outline ? 'btn--outline' : '';

    return (
      <div className={`share-button-dropdown ${margin}`}>
        <DropdownButton
          id={id}
          key={id}
          className={`dropdown--custom ${className} ${greyClass} ${outlineClass}`}
          bsSize={bsSize}
          title={
            <span>
              <i className="cap cap-link" /> {<FormattedMessage id="global.share" />}
            </span>
          }>
          {children}
        </DropdownButton>
      </div>
    );
  }
}

export default ShareButton;
