import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import FacebookLoginButton from './FacebookLoginButton';
import GoogleLoginButton from './GoogleLoginButton';

export const LoginSocialButtons = React.createClass({
  propTypes: {
    features: PropTypes.object.isRequired,
    prefix: PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      prefix: 'login.',
    };
  },

  render() {
    const { features } = this.props;
    if (!features.login_facebook && !features.login_gplus) {
      return null;
    }
    return (
      <div>
        <FacebookLoginButton {...this.props} />
        <GoogleLoginButton {...this.props} />
        <p className="p--centered">
          <span>{this.getIntlMessage('login.or')}</span>
        </p>
      </div>
    );
  },

});

const mapStateToProps = (state) => {
  return { features: state.features };
};

export default connect(mapStateToProps)(LoginSocialButtons);
