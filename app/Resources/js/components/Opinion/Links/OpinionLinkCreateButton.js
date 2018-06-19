// @flow
import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import LoginOverlay from '../../Utils/LoginOverlay';

const OpinionLinkCreateButton = React.createClass({
  propTypes: {
    handleClick: PropTypes.func.isRequired,
  },

  render() {
    const { handleClick } = this.props;
    return (
      <LoginOverlay>
        <Button id="link-form__add" bsStyle="primary" onClick={handleClick}>
          <i className="cap cap-add-1" />
          {<FormattedMessage id="opinion.link.add_new" />}
        </Button>
      </LoginOverlay>
    );
  },
});

export default OpinionLinkCreateButton;
