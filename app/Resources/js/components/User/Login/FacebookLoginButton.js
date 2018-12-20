// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';

type Props = {
  features: Object,
  prefix: string,
};

class FacebookLoginButton extends React.Component<Props> {
  static displayName = 'FacebookLoginButton';

  render() {
    const { features, prefix } = this.props;
    if (!features.login_facebook) {
      return null;
    }
    const label = `${prefix}facebook`;
    return (
      <a
        href={`/login/facebook?_destination=${window && window.location.href}`}
        className="btn login__social-btn login__social-btn--facebook">
        <FormattedMessage id={label} />
      </a>
    );
  }
}

export default FacebookLoginButton;
