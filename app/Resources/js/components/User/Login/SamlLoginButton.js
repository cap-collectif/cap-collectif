// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import type { FeatureToggles } from '../../../types';
import type { LabelPrefix } from './LoginSocialButtons';

type Props = {|
  features: FeatureToggles,
  prefix?: LabelPrefix,
|};

export class SamlLoginButton extends React.Component<Props> {
  static displayName = 'SamlLoginButton';

  render() {
    const { features } = this.props;
    if (!features.login_saml) {
      return null;
    }

    const title = <FormattedMessage id="login.saml" />;
    return (
      <a
        href={`/login-saml?_destination=${window && window.location.href}`}
        title={title}
        className="btn login__social-btn login__social-btn--saml">
        {title}
      </a>
    );
  }
}

export default SamlLoginButton;
