import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import LoginOverlay from '../../Utils/LoginOverlay';
import { Button } from 'react-bootstrap';

const OpinionLinkCreateButton = React.createClass({
  propTypes: {
    handleClick: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    return (
      <LoginOverlay>
        <Button id="link-form__add" bsStyle="primary" onClick={this.props.handleClick}>
          <i className="cap cap-add-1"></i>
          { ' ' + this.getIntlMessage('opinion.link.add_new')}
        </Button>
      </LoginOverlay>
    );
  },

});

export default OpinionLinkCreateButton;
