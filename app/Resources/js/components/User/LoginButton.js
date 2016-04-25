import React from 'react';
import { IntlMixin } from 'react-intl';

const LoginButton = React.createClass({
  mixins: [IntlMixin],

  render() {
    return (
      <a href="/login" className="btn btn-darkest-gray navbar-btn btn--connection">{ this.getIntlMessage('global.login') }</a>
    );
  },

});

export default LoginButton;
