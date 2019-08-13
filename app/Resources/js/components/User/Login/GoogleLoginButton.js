// @flow
import * as React from 'react';
import { type IntlShape, injectIntl, FormattedMessage } from 'react-intl';

import type { FeatureToggles } from '../../../types';
import type { LabelPrefix } from './LoginSocialButtons';

type Props = {|
  features: FeatureToggles,
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
      return intl.formatMessage({ id: 'share.google' });
    }

    return `${prefix || 'login.'}google`;
  };

  render() {
    const { features } = this.props;
    if (!features.login_gplus) {
      return null;
    }

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
