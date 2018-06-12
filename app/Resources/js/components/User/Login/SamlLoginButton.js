// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import type { State } from '../../../types';

type Props = { show: boolean };

export class SamlLoginButton extends React.Component<Props> {
  static displayName = 'SamlLoginButton';

  render() {
    const { show } = this.props;
    if (!show) {
      return null;
    }
    const title = <FormattedMessage id="login.saml" />;
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

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  show: state.default.features.login_saml,
});

export default connect(mapStateToProps)(SamlLoginButton);
