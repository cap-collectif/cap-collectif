// @flow
import * as React from 'react';
import { type IntlShape, injectIntl, FormattedMessage } from 'react-intl';
import type { LabelPrefix } from './LoginSocialButtons';
import SocialIcon from '../../Ui/Icons/SocialIcon';

type Props = {|
  prefix?: LabelPrefix,
  intl: IntlShape,
|};

export class FacebookLoginButton extends React.Component<Props> {
  static displayName = 'FacebookLoginButton';

  static defaultProps = {
    prefix: '',
  };

  getTitleTraduction = (): string => {
    const { prefix, intl } = this.props;

    if (prefix === '') {
      return intl.formatMessage({ id: 'share.facebook' });
    }

    return `${prefix || 'login.'}facebook`;
  };

  render() {
    const title = <FormattedMessage id={this.getTitleTraduction()} />;
    return (
      <div className="login__social-btn login__social-btn--facebook">
        <SocialIcon className="loginIcon" name="facebook" />
        <a href={`/login/facebook?_destination=${window && window.location.href}`} title={title}>
          {title}
        </a>
      </div>
    );
  }
}

export default injectIntl(FacebookLoginButton);
