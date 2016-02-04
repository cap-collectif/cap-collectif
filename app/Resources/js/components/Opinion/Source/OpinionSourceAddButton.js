import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import LoginStore from '../../../stores/LoginStore';
import LoginOverlay from '../../Utils/LoginOverlay';

const OpinionSourceAddButton = React.createClass({
  propTypes: {
    handleClick: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    return (
      <LoginOverlay>
        <Button
          id="source-form__add"
          bsStyle="primary"
          onClick={LoginStore.isLoggedIn() ? this.props.handleClick : null}
        >
          <i className="cap cap-add-1"></i>
          { ' ' + this.getIntlMessage('opinion.add_new_source')}
        </Button>
      </LoginOverlay>
    );
  },

});

export default OpinionSourceAddButton;
