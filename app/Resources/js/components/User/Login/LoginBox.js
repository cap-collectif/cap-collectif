import React, { PropTypes } from 'react';
import { IntlMixin, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Alert } from 'react-bootstrap';
import { LoginSocialButtons } from './LoginSocialButtons';
import LoginForm from './LoginForm';
import type { State } from '../../../types';

export const LoginBox = React.createClass({
  propTypes: {
    textTop: PropTypes.string,
    textBottom: PropTypes.string,
    login_facebook: PropTypes.bool.isRequired,
    login_gplus: PropTypes.bool.isRequired,
    login_saml: PropTypes.bool.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { textTop, textBottom, login_facebook, login_gplus, login_saml } = this.props;
    return (
      <div>
        {
          textTop &&
            <Alert bsStyle="info" className="text-center">
              <FormattedHTMLMessage message={textTop} />
            </Alert>
        }
        <LoginSocialButtons
          features={{
            login_facebook,
            login_gplus,
            login_saml,
          }}
        />
        <LoginForm />
        {
          textBottom &&
            <div className="text-center small excerpt" style={{ marginTop: '15px' }}>
              <FormattedHTMLMessage message={textBottom} />
            </div>
        }
      </div>
    );
  },

});

const mapStateToProps = (state: State) => ({
  login_facebook: state.default.features.login_facebook,
  login_gplus: state.default.features.login_gplus,
  login_saml: state.default.features.login_saml,
  textTop: state.default.parameters['login.text.top'],
  textBottom: state.default.parameters['login.text.bottom'],
});

export default connect(mapStateToProps)(LoginBox);
