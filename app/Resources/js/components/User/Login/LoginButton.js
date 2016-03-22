import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import LoginModal from './LoginModal';
import { Button } from 'react-bootstrap';

const LoginButton = React.createClass({
  propTypes: {
    className: PropTypes.string,
  },
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
    return (
      <span>
        <Button
          onClick={this.handleClick}
          className="btn-darkest-gray navbar-btn btn--connection"
        >
        { this.getIntlMessage('global.login') }
        </Button>
        <LoginModal
          show={this.state.show}
          onClose={this.handleClose}
        />
      </span>
    );
  },

});

export default LoginButton;
