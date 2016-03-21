import React from 'react';
import { IntlMixin } from 'react-intl';
import LoginStore from '../../stores/LoginStore';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import LoginModal from '../User/Login/LoginModal';
import RegistrationModal from '../User/Registration/RegistrationModal';

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
    this.setState({ showLogin: true });
  },

  handleLoginClose() {
    this.setState({ showLogin: false });
  },

  handleRegistrationClick() {
    this.setState({ showRegistration: true });
  },

  handleRegistrationClose() {
    this.setState({ showRegistration: false });
  },

  // We add Popover if user is not connected
  render() {
    const { children } = this.props;
    if (LoginStore.isLoggedIn() || !this.props.enabled) {
      return children;
    }

    const { showRegistration, showLogin } = this.state;
    return (
     <span>
        <OverlayTrigger trigger="focus" placement="top" overlay={
          <Popover id="login-popover" title={this.getIntlMessage('vote.popover.title')}>
            <p>{ this.getIntlMessage('vote.popover.body') }</p>
            <p>
              <Button onClick={this.handleRegistrationClick} className="center-block">layout.registration</Button>
            </p>
            <p>
              <Button onClick={this.handleLoginClick} bsStyle="success" className="center-block">layout.login</Button>
            </p>
          </Popover>
        }
       >
        { children }
       </OverlayTrigger>
       <LoginModal
         show={showLogin}
         onClose={this.handleLoginClose}
       />
       <RegistrationModal
         show={showRegistration}
         onClose={this.handleRegistrationClose}
       />
     </span>
    );
  },

});

export default LoginOverlay;
