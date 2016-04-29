import React, { PropTypes } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { IntlMixin, FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import CloseButton from '../../Form/CloseButton';
import PhoneForm from './PhoneForm';
import SmsCodeForm from './SmsCodeForm';
import UserActions from '../../../actions/UserActions';

const PhoneModal = React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

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
    this.props.onClose();
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
    const { isSubmitting, smsSentToNumber, alert } = this.state;
    const { onClose, show } = this.props;
    return (
      <Modal
        animation={false}
        show={show}
        onHide={onClose}
        aria-labelledby="contained-modal-title-lg"
      >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              {
                smsSentToNumber
                ? this.getIntlMessage('phone.confirm.check_your_phone')
                : this.getIntlMessage('phone.confirm.phone')
              }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {
              alert &&
              <Alert bsStyle={alert.type} onDismiss={this.handleAlertDismiss}>
                {alert.message}
              </Alert>
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
          </Modal.Body>
          <Modal.Footer>
            <CloseButton onClose={onClose} />
            {
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
            }
          </Modal.Footer>
      </Modal>
    );
  },

});

export default PhoneModal;
