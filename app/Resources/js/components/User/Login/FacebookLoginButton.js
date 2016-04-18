import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { IntlMixin } from 'react-intl';

const FacebookLoginButton = React.createClass({
  displayName: 'FacebookLoginButton',
  propTypes: {
    features: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    if (!this.props.features.login_facebook) {
      return null;
    }
    return (
      <a
       href={'/login/facebook?_destination=' + window.location.href}
       title="Sign in with Facebook"
       className="btn login__social-btn login__social-btn--facebook"
      >{this.getIntlMessage('global.login_social.facebook')}</a>
    );
  },

});

const mapStateToProps = (state) => {
  return { features: state.features };
};

export default connect(mapStateToProps)(FacebookLoginButton);
