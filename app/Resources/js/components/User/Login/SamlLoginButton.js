// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import type { LabelPrefix } from './LoginSocialButtons';
import SocialIcon from '../../Ui/Icons/SocialIcon';

type Props = {|
  prefix?: LabelPrefix,
|};

export class SamlLoginButton extends React.Component<Props> {
  static defaultProps = {
    prefix: '',
  };

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
      <div className="login__social-btn login__social-btn--saml">
        <SocialIcon className="loginIcon" name="default" />
        <a href={`/login-saml?_destination=${window && window.location.href}`} title={title}>
          {title}
        </a>
      </div>
    );
  }
}

export default SamlLoginButton;
