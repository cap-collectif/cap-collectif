// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import type { FeatureToggles } from '../../../types';
import { baseUrl } from '../../../config';
import type { LabelPrefix } from './LoginSocialButtons';

type Props = {|
  features: FeatureToggles,
  prefix?: LabelPrefix,
|};

export class OpenIDLoginButton extends React.Component<Props> {
  static displayName = 'OpenIDLoginButton';

  render() {
    const { features } = this.props;
    if (!features.login_openid) {
      return null;
    }

    const title = <FormattedMessage id="login.openid" />;
    const redirectUri = features.disconnect_openid
      ? `${baseUrl}/sso/switch-user`
      : `${window && window.location.href}`;

    return (
      <a
        href={`/login/openid?_destination=${redirectUri}`}
        title={title}
        className="btn login__social-btn login__social-btn--openid">
        {title}
      </a>
    );
  }
}

export default OpenIDLoginButton;
