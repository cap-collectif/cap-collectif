import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import FacebookLoginButton from './FacebookLoginButton';
import GoogleLoginButton from './GoogleLoginButton';

export const LoginSocialButtons = React.createClass({
  propTypes: {
    features: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { features } = this.props;
    if (!features.login_facebook && !features.login_gplus) {
      return null;
    }
    return (
      <div>
        <FacebookLoginButton features={features} />
        <GoogleLoginButton features={features} />
        <p className="p--centered">
          <span>OU</span>
        </p>
      </div>
    );
  },

});

const mapStateToProps = (state) => {
  return { features: state.features };
};

export default connect(mapStateToProps)(LoginSocialButtons);
