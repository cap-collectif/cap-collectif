import React from 'react';
import { IntlMixin } from 'react-intl';
import LoginStore from '../../../stores/LoginStore';
import LoginOverlay from '../../Utils/LoginOverlay';
import { Button } from 'react-bootstrap';

const IdeaCreateButton = React.createClass({
  propTypes: {
    handleClick: React.PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  onClick() {
    if (LoginStore.isLoggedIn()) {
      this.props.handleClick();
    }
  },

  render() {
    return (
      <LoginOverlay>
        <Button
          id="idea-create-button"
          bsStyle="primary"
          onClick={this.onClick}
          className="form-control"
        >
          <i className="cap cap-add-1"></i>
          { ' ' + this.getIntlMessage('idea.add')}
        </Button>
      </LoginOverlay>
    );
  },

});

export default IdeaCreateButton;
