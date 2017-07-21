// @flow
import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';

const FacebookLoginButton = React.createClass({
  displayName: 'FacebookLoginButton',
  propTypes: {
    features: PropTypes.object.isRequired,
    prefix: PropTypes.string.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const {
      features,
      prefix,
    } = this.props;
    if (!features.login_facebook) {
      return null;
    }
    const label = `${prefix}facebook`;
    return (
      <a
        href={`/login/facebook?_destination=${window && window.location.href}`}
       title={this.getIntlMessage(label)}
       className="btn login__social-btn login__social-btn--facebook"
      >
        { this.getIntlMessage(label) }
      </a>
    );
  },

});

export default FacebookLoginButton;
