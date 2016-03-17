import React from 'react';
import { IntlMixin } from 'react-intl';
import LoginStore from '../../stores/LoginStore';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import RegistrationButton from '../User/Registration/RegistrationButton';
import LoginButton from '../User/Login/LoginButton';
import LoginModal from '../User/Login/LoginModal';

const LoginOverlay = React.createClass({
  propTypes: {
    children: React.PropTypes.element.isRequired,
    enabled: React.PropTypes.bool,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      enabled: true,
    };
  },

  getInitialState() {
    return {
      showLogin: false,
      showRegistration: false,
    };
  },

  handleLoginClick() {
    this.setState({showLogin: true});
  },

  handleLoginClose() {
    this.setState({showLogin: false});
  },

  // We add Popover if user is not connected
  render() {
    if (LoginStore.isLoggedIn() || !this.props.enabled) {
      return this.props.children;
    }

    return (
      <span>
      <OverlayTrigger trigger="focus" placement="top" overlay={
          <Popover id="login-popover" title={this.getIntlMessage('vote.popover.title')}>
            <p>
              { this.getIntlMessage('vote.popover.body') }
            </p>
            <p>
              <Button onClick={this.handleRegistrationClick} className="center-block">layout.registration</Button>
            </p>
            <p>
            <Button onClick={this.handleLoginClick} bsStyle="success" className="center-block">layout.login</Button>
            </p>
          </Popover>}
      >
        { this.props.children }
      </OverlayTrigger>
      <LoginModal
        show={this.state.showLogin}
        onClose={this.handleLoginClose}
      />
      </span>
    );
  },

});

export default LoginOverlay;
