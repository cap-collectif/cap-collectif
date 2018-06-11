// @flow
import React from 'react';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import LoginOverlay from '../../Utils/LoginOverlay';

type Props = {
  handleClick: Function,
  disabled?: boolean,
};

class OpinionSourceAddButton extends React.Component<Props> {
  render() {
    const { disabled, handleClick } = this.props;
    return (
      <LoginOverlay>
        <Button
          id="source-form__add"
          disabled={disabled}
          bsStyle="primary"
          onClick={disabled ? null : handleClick}>
          <i className="cap cap-add-1" />
          <FormattedMessage id="opinion.add_new_source" />
        </Button>
      </LoginOverlay>
    );
  }
}

export default OpinionSourceAddButton;
