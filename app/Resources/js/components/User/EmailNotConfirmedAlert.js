import React, { PropTypes } from 'react';
import { IntlMixin, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Alert, Button } from 'react-bootstrap';
import Fetcher from '../../services/Fetcher';

export const EmailNotConfirmedAlert = React.createClass({
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
      .catch(() => {
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
          <FormattedHTMLMessage
            message={this.getIntlMessage('user.confirm.email')}
            email={user.email}
          />
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

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default connect(mapStateToProps)(EmailNotConfirmedAlert);
