// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import type { FeatureToggles, ReduxStoreSSOConfiguration, State } from '../../../types';
import LoginSocialButton from '../../Ui/Button/LoginSocialButton';

export type LabelPrefix = 'registration.' | 'login.' | '';

type StateProps = {|
  features: FeatureToggles,
  ssoList: Array<ReduxStoreSSOConfiguration>,
|};

type Props = {|
  ...StateProps,
  prefix?: LabelPrefix,
|};

export class LoginSocialButtons extends React.Component<Props> {
  render() {
    const { features, ssoList } = this.props;

    if (
      !features.login_facebook &&
      !features.login_gplus &&
      !features.login_saml &&
      !(ssoList.length > 0 && ssoList.filter(sso => sso.ssoType === 'oauth2').length > 0) &&
      !features.login_franceconnect
    ) {
      return null;
    }

    /* @TODO: Add more Login button in mapping when it will be configurable. */
    return (
      <>
        <div className="font-weight-semi-bold">
          <FormattedMessage id="authenticate-with" />
        </div>
        {features.login_saml && <LoginSocialButton type="saml" />}
        {ssoList.length > 0 &&
          ssoList.map(
            (
              { ssoType, name, buttonColor, labelColor }: ReduxStoreSSOConfiguration,
              index: number,
            ) => {
              switch (ssoType) {
                case 'oauth2':
                  return (
                    <LoginSocialButton
                      text={name}
                      labelColor={labelColor}
                      buttonColor={buttonColor}
                      key={index}
                      switchUserMode={features.disconnect_openid || false}
                      type="openId"
                    />
                  );
                case 'franceconnect':
                  return (
                    features.login_franceconnect && (
                      <LoginSocialButton key={index} type="franceConnect" />
                    )
                  );
                default:
                  break;
              }
            },
          )}
        {features.login_facebook && <LoginSocialButton type="facebook" />}
        {features.login_gplus && <LoginSocialButton type="google" />}
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
