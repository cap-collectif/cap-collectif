import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import LoginModal from './LoginModal';
import LoginStore from '../../../stores/LoginStore';
import { ButtonToolbar, Button } from 'react-bootstrap';

const LoginButton = React.createClass({
  propTypes: {
    className: PropTypes.string,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      show: false,
    }
  },

  handleClick() {
    this.setState({show: true});
  },

  render() {
    return (
      <span>
        <a onClick={this.handleClick} className="btn btn-darkest-gray navbar-btn btn--connection">layout.login</a>
        <LoginModal show={this.state.show} onClose={() => {}} />
      </span>
    );
  },

});

export default LoginButton;
