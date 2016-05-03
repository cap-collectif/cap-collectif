import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';

export const GoogleLoginButton = React.createClass({
  displayName: 'GoogleLoginButton',
  propTypes: {
    features: PropTypes.object.isRequired,
    prefix: PropTypes.string.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    if (!this.props.features.login_gplus) {
      return null;
    }
    const label = this.props.prefix + 'google';
    return (
      <a
       href={'/login/google?_destination=' + window.location.href}
       title={this.getIntlMessage(label)}
       className="btn login__social-btn login__social-btn--googleplus"
      >{this.getIntlMessage(label)}</a>
    );
  },

});

export default GoogleLoginButton;
