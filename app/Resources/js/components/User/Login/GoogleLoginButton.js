import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';

export const GoogleLoginButton = React.createClass({
  displayName: 'GoogleLoginButton',
  propTypes: {
    features: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    if (!this.props.features.login_gplus) {
      return null;
    }
    return (
      <a
       href={'/login/google?_destination=' + window.location.href}
       title={this.getIntlMessage('global.login_social.google')}
       className="btn login__social-btn login__social-btn--googleplus"
      >{this.getIntlMessage('global.login_social.google')}</a>
    );
  },

});

export default GoogleLoginButton;
