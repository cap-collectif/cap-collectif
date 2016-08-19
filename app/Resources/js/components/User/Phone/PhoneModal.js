import React, { PropTypes } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { IntlMixin, FormattedHTMLMessage } from 'react-intl';
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
      isResending: false,
      smsSentToNumber: null,
      alert: null,
    };
  },

  onSubmitSuccess(phone) {
    this.setState({ smsSentToNumber: phone });
    this.stopSubmit();
  },

  onCodeSuccess() {
    const { onClose } = this.props;
    window.location.reload();
    onClose();
  },

  askChangeNumber() {
    this.setState(this.getInitialState());
  },

  handleSubmit() {
    this.setState({ isSubmitting: true });
  },

  stopSubmit() {
    this.setState({ isSubmitting: false });
  },

  resendSmsCode(e) {
    e.preventDefault();
    this.setState({ isResending: true });
    UserActions
      .sendConfirmSms()
      .then(() => {
        this.setState({ isResending: false, alert: { type: 'success', message: this.getIntlMessage('phone.confirm.alert.received') } });
      })
      .catch((err) => {
        let message = err.response.message;
        if (message === 'sms_already_sent_recently') {
          message = this.getIntlMessage('phone.confirm.alert.wait_for_new');
        }
        if (message === 'sms_failed_to_send') {
          message = this.getIntlMessage('phone.confirm.alert.failed_to_send');
        }
        this.setState({ isResending: false, alert: { type: 'danger', message } });
      });
  },

  handleAlertDismiss() {
    this.setState({ alert: null });
  },

  render() {
    const { isSubmitting, isResending, smsSentToNumber, alert } = this.state;
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
              <Alert bsStyle={alert.type} onDismiss={this.handleAlertDismiss} dismissAfter={2000}>
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
                  onSubmit={this.handleSubmit}
                  onSubmitFailure={this.stopSubmit}
                  onSubmitSuccess={this.onSubmitSuccess}
              />
            }
            {
              smsSentToNumber &&
              <div>
                <Button style={{ paddingLeft: 0, paddingRight: 0 }} onClick={this.resendSmsCode} bsStyle="link" disabled={isResending}>
                  {this.getIntlMessage('phone.confirm.ask_new')}
                </Button>
                { ' • ' }
                <Button style={{ paddingLeft: 0 }} onClick={this.askChangeNumber} bsStyle="link">
                  {this.getIntlMessage('phone.confirm.ask_change_number')}
                </Button>
              </div>
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
