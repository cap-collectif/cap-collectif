// @flow
import React, { PropTypes } from 'react';
import { IntlMixin, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Alert } from 'react-bootstrap';
import LoginSocialButtons from './LoginSocialButtons';
import LoginForm from './LoginForm';
import type { State } from '../../../types';

export const LoginBox = React.createClass({
  propTypes: {
    textTop: PropTypes.string,
    textBottom: PropTypes.string,
  },
  mixins: [IntlMixin],

  render() {
    const { textTop, textBottom } = this.props;
    return (
      <div>
        {
          textTop &&
            <Alert bsStyle="info" className="text-center">
              <FormattedHTMLMessage message={textTop} />
            </Alert>
        }
        <LoginSocialButtons />
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
  textTop: state.default.parameters['login.text.top'],
  textBottom: state.default.parameters['login.text.bottom'],
});

export default connect(mapStateToProps)(LoginBox);
