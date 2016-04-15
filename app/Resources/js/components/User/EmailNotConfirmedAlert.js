import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { Alert, Button } from 'react-bootstrap';
import Fetcher from '../../services/Fetcher';

const EmailNotConfirmedAlert = React.createClass({
  propTypes: {
    user: PropTypes.object,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      user: null,
    };
  },

  getInitialState() {
    return {
      resendingConfirmation: false,
      confirmationSent: false,
    };
  },

  handleResend() {
    this.setState({ resendingConfirmation: true });
    Fetcher
      .post('/resend-email-confirmation', {})
      .then(() => {
        this.setState({
          resendingConfirmation: false,
          confirmationSent: true,
        });
      })
    ;
  },

  render() {
    const { user } = this.props;
    if (!user || user.isEmailConfirmed) {
      return null;
    }
    const { confirmationSent, resendingConfirmation } = this.state;
    return (
      <Alert bsStyle="warning" id="alert-email-not-confirmed">
        <div className="container">
          <p>{ this.getIntlMessage('user.confirm.email') } <strong>{ user.email }</strong>.</p>
          <p style={{ marginBottom: 0 }}>
            {
              confirmationSent
              ? <Button bsStyle="primary" disabled>
                  { this.getIntlMessage('user.confirm.sent') }
                </Button>
              : <Button
                  disabled={resendingConfirmation}
                  onClick={resendingConfirmation ? null : this.handleResend}
                >
                  {
                    resendingConfirmation
                    ? this.getIntlMessage('user.confirm.sending')
                    : this.getIntlMessage('user.confirm.resend')
                  }
                </Button>
            }
            <a className="small" style={{ marginLeft: 10 }} href="/profile/edit-profile">{ this.getIntlMessage('user.confirm.update') }</a>
          </p>
        </div>
      </Alert>
    );
  },
});

export default EmailNotConfirmedAlert;
