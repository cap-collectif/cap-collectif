// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import type { FeatureToggles } from '../../../types';
import type { LabelPrefix } from './LoginSocialButtons';

type Props = {|
  features: FeatureToggles,
  prefix?: LabelPrefix,
|};

export class GoogleLoginButton extends React.Component<Props> {
  static displayName = 'GoogleLoginButton';

  static defaultProps = {
    prefix: '',
  };

  getTitleTraduction = (): string => {
    const { prefix } = this.props;

    if (prefix === '') {
      return 'Google';
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

export default GoogleLoginButton;
