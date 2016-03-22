import React from 'react';
import { IntlMixin } from 'react-intl';
import { Alert, Button } from 'react-bootstrap';
import LoginStore from '../../stores/LoginStore';
import Fetcher from '../../services/Fetcher';

const EmailNotConfirmedAlert = React.createClass({
  mixins: [IntlMixin],

  getInitialState() {
    return {
      resendingConfirmation: false,
      confirmationSent: false,
    };
  },

  handleResend() {
    this.setState({ resendingConfirmation: true });
    Fetcher
      .post('/re-send-email-confirmation', {})
      .then(() => {
        this.setState({
          resendingConfirmation: false,
          confirmationSent: true,
        });
      })
    ;
  },

  render() {
    if (!LoginStore.isLoggedIn() || LoginStore.isEmailConfirmed()) {
      return null;
    }
    const { confirmationSent, resendingConfirmation } = this.state;
    return (
      <Alert bsStyle="warning">
        <div className="container">
          <p>{ this.getIntlMessage('user.confirm.email') } <strong>{ LoginStore.email }</strong>.</p>
          <p>
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
            { ' ' }
            <a href="/profile/edit-profile">{ this.getIntlMessage('user.confirm.update') }</a>
          </p>
        </div>
      </Alert>
    );
  },
});

export default EmailNotConfirmedAlert;
