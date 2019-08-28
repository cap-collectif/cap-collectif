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
    const { features } = this.props;
    if (!features.login_facebook) {
      return null;
    }

    const title = <FormattedMessage id={this.getTitleTraduction()} />;
    return (
      <a
        href={`/login/facebook?_destination=${window && window.location.href}`}
        className="btn login__social-btn login__social-btn--facebook"
        title={title}>
        {title}
      </a>
    );
  }
}

export default injectIntl(FacebookLoginButton);
