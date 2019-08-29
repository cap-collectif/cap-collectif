// @flow
import * as React from 'react';
import { type IntlShape, injectIntl, FormattedMessage } from 'react-intl';
import type { LabelPrefix } from './LoginSocialButtons';

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
      return intl.formatMessage({ id: 'google' });
    }

    return `${prefix || 'login.'}google`;
  };

  render() {
    const title = <FormattedMessage id={this.getTitleTraduction()} />;
    return (
      <a
        href={`/login/google?_destination=${window && window.location.href}`}
        className="btn login__social-btn login__social-btn--googleplus"
        title={title}>
        {title}
      </a>
    );
  }
}

export default injectIntl(GoogleLoginButton);
