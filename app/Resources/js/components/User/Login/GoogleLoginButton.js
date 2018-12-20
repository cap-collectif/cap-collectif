// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';

type Props = {
  features: Object,
  prefix: string,
};

export class GoogleLoginButton extends React.Component<Props> {
  static displayName = 'GoogleLoginButton';

  render() {
    const { features, prefix } = this.props;
    if (!features.login_gplus) {
      return null;
    }
    const label = `${prefix}google`;
    return (
      <a
        href={`/login/google?_destination=${window && window.location.href}`}
        title={<FormattedMessage id={label} />}
        className="btn login__social-btn login__social-btn--googleplus">
        {<FormattedMessage id={label} />}
      </a>
    );
  }
}

export default GoogleLoginButton;
