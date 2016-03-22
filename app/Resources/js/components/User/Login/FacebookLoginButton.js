import React from 'react';
import { IntlMixin } from 'react-intl';
import FeatureStore from '../../../stores/FeatureStore';

const FacebookLoginButton = React.createClass({
  displayName: 'FacebookLoginButton',
  mixins: [IntlMixin],

  render() {
    if (!FeatureStore.isActive('login_facebook')) {
      return null;
    }
    return (
      <a
       href={'/login/facebook?_destination=' + window.location.href}
       title="Sign in with Facebook"
       className="btn login__social-btn login__social-btn--facebook"
      >Se connecter avec Facebook</a>
    );
  },

});

export default FacebookLoginButton;
