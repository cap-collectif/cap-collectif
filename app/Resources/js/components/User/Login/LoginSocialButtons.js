// @flow
import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import FacebookLoginButton from './FacebookLoginButton';
import GoogleLoginButton from './GoogleLoginButton';
import SamlLoginButton from './SamlLoginButton';
import type { State } from '../../../types';

export const LoginSocialButtons = React.createClass({
  propTypes: {
    features: PropTypes.object.isRequired,
    prefix: PropTypes.string,
  },

  getDefaultProps() {
    return {
      prefix: 'login.',
    };
  },

  render() {
    const { features } = this.props;
    if (
      !features.login_facebook &&
      !features.login_gplus &&
      !features.login_saml
    ) {
      return null;
    }
    return (
      <div>
        <FacebookLoginButton {...this.props} />
        <GoogleLoginButton {...this.props} />
        <SamlLoginButton {...this.props} />
        <p className="p--centered">
          <span>
            {<FormattedMessage id="login.or" />}
          </span>
        </p>
      </div>
    );
  },
});

const mapStateToProps = (state: State) => ({
  features: state.default.features,
});

export default connect(mapStateToProps)(LoginSocialButtons);
