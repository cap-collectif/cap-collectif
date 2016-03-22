import React from 'react';
import { Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import FeatureStore from '../../../stores/FeatureStore';
import RegistrationModal from './RegistrationModal';

const RegistrationButton = React.createClass({
  mixins: [IntlMixin],

  getInitialState() {
    return {
      show: false,
    };
  },

  handleClick() {
    this.setState({ show: true });
  },

  handleClose() {
    this.setState({ show: false });
  },

  render() {
    if (!FeatureStore.isActive('registration')) {
      return null;
    }
    return (
      <span>
        <Button
          onClick={this.handleClick}
          bsStyle="primary"
          className="navbar-btn btn--registration"
        >
          { this.getIntlMessage('global.register') }
        </Button>
        <RegistrationModal
          show={this.state.show}
          onClose={this.handleClose}
        />
      </span>
    );
  },

});

export default RegistrationButton;
