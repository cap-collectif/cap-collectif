// @flow
import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

const FacebookLoginButton = React.createClass({
  displayName: 'FacebookLoginButton',

  propTypes: {
    features: PropTypes.object.isRequired,
    prefix: PropTypes.string.isRequired,
  },

  render() {
    const { features, prefix } = this.props;
    if (!features.login_facebook) {
      return null;
    }
    const label = `${prefix}facebook`;
    return (
      <a
        href={`/login/facebook?_destination=${window && window.location.href}`}
        title={<FormattedMessage id={label} />}
        className="btn login__social-btn login__social-btn--facebook">
        <FormattedMessage id={label} />
      </a>
    );
  },
});

export default FacebookLoginButton;
