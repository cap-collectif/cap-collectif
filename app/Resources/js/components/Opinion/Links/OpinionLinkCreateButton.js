import React from 'react';
import {IntlMixin} from 'react-intl';
import LoginStore from '../../../stores/LoginStore';
import LoginOverlay from '../../Utils/LoginOverlay';
import {Button} from 'react-bootstrap';

const OpinionLinkCreateButton = React.createClass({
  propTypes: {
    handleClick: React.PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    return (
      <LoginOverlay>
        <Button id="link-form__add" bsStyle="primary" onClick={LoginStore.isLoggedIn() ? this.props.handleClick : null}>
          <i className="cap cap-add-1"></i>
          { ' ' + this.getIntlMessage('opinion.link.add_new')}
        </Button>
      </LoginOverlay>
    );
  },

});

export default OpinionLinkCreateButton;
