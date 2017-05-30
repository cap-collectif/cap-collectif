// @flow
import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import LoginOverlay from '../../Utils/LoginOverlay';

const OpinionSourceAddButton = React.createClass({
  propTypes: {
    handleClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
  },
  mixins: [IntlMixin],

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
          {` ${this.getIntlMessage('opinion.add_new_source')}`}
        </Button>
      </LoginOverlay>
    );
  },
});

export default OpinionSourceAddButton;
