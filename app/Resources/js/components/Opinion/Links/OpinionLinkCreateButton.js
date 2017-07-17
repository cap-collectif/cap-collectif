// @flow
import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { Button } from 'react-bootstrap';
import LoginOverlay from '../../Utils/LoginOverlay';

const OpinionLinkCreateButton = React.createClass({
  propTypes: {
    handleClick: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { handleClick } = this.props;
    return (
      <LoginOverlay>
        <Button id="link-form__add" bsStyle="primary" onClick={handleClick}>
          <i className="cap cap-add-1" />
          {` ${this.getIntlMessage('opinion.link.add_new')}`}
        </Button>
      </LoginOverlay>
    );
  },
});

export default OpinionLinkCreateButton;
