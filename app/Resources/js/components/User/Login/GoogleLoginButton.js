// @flow
import * as React from 'react';
import { type IntlShape, injectIntl, FormattedMessage } from 'react-intl';
import type { LabelPrefix } from './LoginSocialButtons';
import SocialIcon from '../../Ui/Icons/SocialIcon';

type Props = {|
  prefix?: LabelPrefix,
  intl: IntlShape,
|};

export class GoogleLoginButton extends React.Component<Props> {
  static displayName = 'GoogleLoginButton';

  static defaultProps = {
    prefix: '',
  };

  getTitleTraduction = (): string => {
    const { prefix, intl } = this.props;

    if (prefix === '') {
      return intl.formatMessage({ id: 'Google' });
    }

    return `${prefix || 'login.'}google`;
  };

  render() {
    const title = <FormattedMessage id={this.getTitleTraduction()} />;
    return (
      <div className="login__social-btn login__social-btn--googleplus">
        <SocialIcon className="loginIcon" name="google" />
        <a href={`/login/google?_destination=${window && window.location.href}`} title={title}>
          {title}
        </a>
      </div>
    );
  }
}

export default injectIntl(GoogleLoginButton);
