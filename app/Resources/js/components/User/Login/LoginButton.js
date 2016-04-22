import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { Button } from 'react-bootstrap';
import LoginModal from './LoginModal';

const LoginButton = React.createClass({
  propTypes: {
    bsStyle: PropTypes.string,
    className: PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      bsStyle: 'default',
      className: '',
    };
  },

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
    const { bsStyle, className } = this.props;
    return (
      <span>
        <Button
          bsStyle={bsStyle}
          onClick={this.handleClick}
          className={className}
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
