// @flow
import React, { PropTypes } from 'react';
import { IntlMixin, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Alert, Button } from 'react-bootstrap';
import { resendConfirmation } from '../../redux/modules/user';
import type { State } from '../../types';

export const NewEmailNotConfirmedAlert = React.createClass({
  propTypes: {
    newEmailToConfirm: PropTypes.string,
    sendSucceed: PropTypes.bool,
  },
  mixins: [IntlMixin],

  render() {
    const { sendSucceed, newEmailToConfirm } = this.props;
    if (!newEmailToConfirm) {
      return null;
    }
    const editEmailUrl = `${window.location.protocol}//${window.location.host}/profile/edit-account`;
    return (
      <Alert bsStyle="warning" id="alert-new-email-not-confirmed">
        <div className="container">
          <div className="col-md-7" style={{ marginBottom: 5 }}>
            {
              sendSucceed &&
                <FormattedHTMLMessage
                  message={this.getIntlMessage('user.confirm.new_email_send_succeed')}
                  email={newEmailToConfirm}
                />
            }
          </div>
          <div className="col-md-5">
            <Button
              style={{ marginRight: 15, marginBottom: 5 }}
              onClick={() => resendConfirmation()}
            >
              {
                this.getIntlMessage('user.confirm.resend')
              }
            </Button>
            <Button bsStyle="link" style={{ marginBottom: 5 }} href={editEmailUrl}>
              { sendSucceed && this.getIntlMessage('user.confirm.new_email_send_succeed_cancel_or_update') }
            </Button>
          </div>
        </div>
      </Alert>
    );
  },
});

const mapStateToProps = (state: State) => ({
  newEmailToConfirm: state.user.user && state.user.user.newEmailToConfirm,
  sendSucceed: true,
});

export default connect(mapStateToProps)(NewEmailNotConfirmedAlert);
