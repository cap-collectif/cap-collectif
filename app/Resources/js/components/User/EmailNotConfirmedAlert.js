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
          {
              confirmationSent
              ? <Button style={{ marginLeft: 15 }} bsStyle="primary" disabled>
                  { this.getIntlMessage('user.confirm.sent') }
                </Button>
              : <Button style={{ marginLeft: 15 }}
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
          <Button style={{ marginLeft: 15 }} href="/profile/edit-profile">{ this.getIntlMessage('user.confirm.update') }</Button>
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
