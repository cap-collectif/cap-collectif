import React from 'react';
import { IntlMixin } from 'react-intl';
import FeatureStore from '../../../stores/FeatureStore';

const GoogleLoginButton = React.createClass({
  displayName: 'GoogleLoginButton',
  mixins: [IntlMixin],

  render() {
    if (!FeatureStore.isActive('login_gplus')) {
      return null;
    }
    return (
      <a
       href={'/login/google?_destination=' + window.location.href}
       title="Sign in with Google"
       className="btn login__social-btn login__social-btn--googleplus"
      >{this.getIntlMessage('gobal.login_social.google')}</a>
    );
  },

});

export default GoogleLoginButton;
