import React from 'react';
import { IntlMixin } from 'react-intl';
import FeatureStore from '../../../stores/FeatureStore';
import FacebookLoginButton from './FacebookLoginButton';
import GoogleLoginButton from './GoogleLoginButton';

const LoginSocialButtons = React.createClass({
  mixins: [IntlMixin],

  render() {
    if (!FeatureStore.isActive('login_facebook') && FeatureStore.isActive('login_gplus')) {
      return null;
    }
    return (
      <div>
        <FacebookLoginButton />
        <GoogleLoginButton />
        <p className="p--centered"><span>OU</span></p>
      </div>
    );
  },

});

export default LoginSocialButtons;
