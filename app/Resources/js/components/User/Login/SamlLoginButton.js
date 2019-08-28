// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import type { LabelPrefix } from './LoginSocialButtons';

type Props = {|
  prefix?: LabelPrefix,
|};

export class SamlLoginButton extends React.Component<Props> {
  getTitleTraduction = (): string => {
    const { prefix } = this.props;

    if (prefix === '') {
      return 'SAML';
    }

    return `${prefix || 'login.'}saml`;
  };

  render() {
    const title = <FormattedMessage id={this.getTitleTraduction()} />;
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
