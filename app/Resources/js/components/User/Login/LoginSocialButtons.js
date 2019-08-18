// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import FacebookLoginButton from './FacebookLoginButton';
import GoogleLoginButton from './GoogleLoginButton';
import SamlLoginButton from './SamlLoginButton';
import OpenIDLoginButton from './OpenIDLoginButton';
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
      !features.login_openid
    ) {
      return null;
    }

    /* @TODO: Add more Login button in mapping when it will be configurable. */
    return (
      <div>
        <FacebookLoginButton features={features} prefix={prefix} />
        <GoogleLoginButton features={features} prefix={prefix} />
        <SamlLoginButton features={features} prefix={prefix} />
        {ssoList.length > 0 &&
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
  ssoList: state.default.ssoList,
});

export default connect(mapStateToProps)(LoginSocialButtons);
