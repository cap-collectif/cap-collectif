// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import SamlLoginButton from './SamlLoginButton';
import GoogleLoginButton from './GoogleLoginButton';
import OpenIDLoginButton from './OpenIDLoginButton';
import FacebookLoginButton from './FacebookLoginButton';
import type { FeatureToggles, SSOConfiguration, State } from '../../../types';

export type LabelPrefix = 'registration.' | 'login.' | '';

type StateProps = {|
  features: FeatureToggles,
  ssoList: Array<SSOConfiguration>,
|};

type Props = {|
  ...StateProps,
  prefix?: LabelPrefix,
|};

export class LoginSocialButtons extends React.Component<Props> {
  render() {
    const { features, ssoList, prefix } = this.props;

    if (
      !features.login_facebook &&
      !features.login_gplus &&
      !features.login_saml &&
      (!features.login_openid || !ssoList.length)
    ) {
      return null;
    }

    /* @TODO: Add more Login button in mapping when it will be configurable. */
    return (
      <>
        <div className="font-weight-semi-bold">
          <FormattedMessage id="authenticate-with" />
        </div>
        <SamlLoginButton features={features} prefix={prefix} />
        {ssoList.length > 0 && (
            <FormattedMessage id="authenticate-with" className="font-weight-semi-bold" />
          ) &&
          ssoList.map(
            ({ ssoType, name, buttonColor, labelColor }: SSOConfiguration, index: number) =>
              ssoType === 'oauth2' && (
                <OpenIDLoginButton
                  text={name}
                  key={index}
                  features={features}
                  prefix={prefix}
                  labelColor={labelColor}
                  buttonColor={buttonColor}
                />
              ),
          )}
        <FacebookLoginButton features={features} prefix={prefix} />
        <GoogleLoginButton features={features} prefix={prefix} />
        {!features.sso_by_pass_auth && (
          <p className="p--centered">
            <FormattedMessage id="login.or" />
          </p>
        )}
      </>
    );
  }
}

const mapStateToProps = (state: State) => ({
  features: state.default.features,
  ssoList: state.default.ssoList,
});

export default connect(mapStateToProps)(LoginSocialButtons);
