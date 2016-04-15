import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { IntlMixin } from 'react-intl';

const GoogleLoginButton = React.createClass({
  displayName: 'GoogleLoginButton',
  propTypes: {
    features: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    if (!this.props.features.login_gplus) {
      return null;
    }
    return (
      <a
       href={'/login/google?_destination=' + window.location.href}
       title="Sign in with Google"
       className="btn login__social-btn login__social-btn--googleplus"
      >{this.getIntlMessage('global.login_social.google')}</a>
    );
  },

});

const mapStateToProps = (state) => {
  return { features: state.features };
};

export default connect(mapStateToProps)(GoogleLoginButton);
