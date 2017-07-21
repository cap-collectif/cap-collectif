// @flow
import React, { PropTypes } from 'react';
import { IntlMixin, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Alert, Button } from 'react-bootstrap';
import Fetcher from '../../services/Fetcher';
import type { State } from '../../types';

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
      .post('/account/resend_confirmation_email')
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
    const editEmailUrl = `${window.location.protocol}//${window.location.host}/profile/edit-account`;
    const { confirmationSent, resendingConfirmation } = this.state;
    return (
      <Alert bsStyle="warning" id="alert-email-not-confirmed">
        <div className="container">
          <div className="col-md-7" style={{ marginBottom: 5 }}>
            <FormattedHTMLMessage
              message={this.getIntlMessage('user.confirm.email')}
              email={user.email}
              link="http://aide.cap-collectif.com/article/9-pourquoi-dois-je-confirmer-mon-adresse-electronique"
            />
          </div>
          <div className="col-md-5">
            {
              confirmationSent
                ? <Button style={{ marginRight: 15, marginBottom: 5 }} bsStyle="primary" disabled>
                  { this.getIntlMessage('user.confirm.sent') }
                </Button>
              : <Button style={{ marginRight: 15, marginBottom: 5 }}
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
            <Button
              style={{ marginBottom: 5 }}
              href={editEmailUrl}
            >
              { this.getIntlMessage('user.confirm.update') }
            </Button>
          </div>
        </div>
      </Alert>
    );
  },
});

const mapStateToProps = (state: State) => ({
  user: state.user.user,
});

export default connect(mapStateToProps)(EmailNotConfirmedAlert);
