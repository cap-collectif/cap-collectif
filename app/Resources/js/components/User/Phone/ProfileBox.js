import React, { PropTypes } from 'react';
import { Panel, Button, Alert } from 'react-bootstrap';
import { IntlMixin, FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import PhoneForm from './PhoneForm';
import SmsCodeForm from './SmsCodeForm';
import UserActions from '../../../actions/UserActions';

const PhoneModal = React.createClass({
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
      isSubmitting: false,
      smsSentToNumber: null,
      alert: null,
    };
  },

  onSubmitSuccess(phone) {
    this.setState({ smsSentToNumber: phone });
    this.stopSubmit();
  },

  onCodeSuccess() {
    window.location.reload();
  },

  handleSubmit() {
    this.setState({ isSubmitting: true });
  },

  stopSubmit() {
    this.setState({ isSubmitting: false });
  },

  resendSmsCode(e) {
    e.preventDefault();
    UserActions
      .sendConfirmSms()
      .then(() => {
        this.setState({ alert: { type: 'success', message: this.getIntlMessage('phone.confirm.alert.received') } });
      })
      .catch((err) => {
        let message = err.response.message;
        if (message === 'Sms already sent less than a minute ago.') {
          message = this.getIntlMessage('phone.confirm.alert.wait_for_new');
        }
        this.setState({ alert: { type: 'danger', message: message } });
      });
  },

  handleAlertDismiss() {
    this.setState({ alert: null });
  },

  render() {
    const { user } = this.props;
    const { isSubmitting, smsSentToNumber, alert } = this.state;
    const header = smsSentToNumber
        ? this.getIntlMessage('phone.confirm.check_your_phone')
        : this.getIntlMessage('phone.confirm.phone')
    ;
    const footer = (
      !smsSentToNumber &&
      <Button
        id="confirm-continue"
        onClick={this.handleSubmit}
        disabled={isSubmitting}
        bsStyle="primary"
      >
        {isSubmitting
          ? this.getIntlMessage('global.loading')
          : this.getIntlMessage('global.continue')
        }
      </Button>
    );
    return (
      <Panel header={header} footer={footer}>
            {
              alert &&
              <Alert bsStyle={alert.type} onDismiss={this.handleAlertDismiss}>
                {alert.message}
              </Alert>
            }
            {
              user.phone &&
              <FormattedHTMLMessage message={this.getIntlMessage('phone.confirm.infos')} />
            }
            {
              smsSentToNumber
               ? <FormattedHTMLMessage
                    message={this.getIntlMessage('phone.confirm.sent')}
                    phone={smsSentToNumber}
                 />
              : <FormattedHTMLMessage message={this.getIntlMessage('phone.confirm.infos')} />
            }
            {
              smsSentToNumber
              ? <SmsCodeForm
                  onSubmitSuccess={this.onCodeSuccess}
                />
              : <PhoneForm
                  isSubmitting={isSubmitting}
                  onSubmitFailure={this.stopSubmit}
                  onSubmitSuccess={this.onSubmitSuccess}
                />
            }
            {
              smsSentToNumber &&
              <a onClick={this.resendSmsCode} href>
                {this.getIntlMessage('phone.confirm.ask_new')}
              </a>
            }
      </Panel>
    );
  },

});

export default PhoneModal;
