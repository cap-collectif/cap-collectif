// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import FacebookLoginButton from './FacebookLoginButton';
import GoogleLoginButton from './GoogleLoginButton';
import SamlLoginButton from './SamlLoginButton';
import OpenIDLoginButton from './OpenIDLoginButton';
import type { FeatureToggles, State } from '../../../types';

export type LabelPrefix = 'registration.' | 'login.';

type StateProps = {|
  features: FeatureToggles,
|};

type Props = {|
  ...StateProps,
  prefix?: LabelPrefix,
|};

export class LoginSocialButtons extends React.Component<Props> {
  render() {
    const { features } = this.props;
    if (
      !features.login_facebook &&
      !features.login_gplus &&
      !features.login_saml &&
      !features.login_openid
    ) {
      return null;
    }
    return (
      <div>
        <FacebookLoginButton {...this.props} />
        <GoogleLoginButton {...this.props} />
        <SamlLoginButton {...this.props} />
        <OpenIDLoginButton {...this.props} />
        {!features.sso_by_pass_auth && (
          <p className="p--centered">
            <span>{<FormattedMessage id="login.or" />}</span>
          </p>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  features: state.default.features,
});

export default connect(mapStateToProps)(LoginSocialButtons);
