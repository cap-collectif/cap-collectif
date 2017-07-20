import React, { PropTypes } from 'react';
import { Panel, Button, Alert } from 'react-bootstrap';
import { connect } from 'react-redux';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import PhoneForm from './PhoneForm';
import SmsCodeForm from './SmsCodeForm';
import UserActions from '../../../actions/UserActions';
import AppDispatcher from '../../../dispatchers/AppDispatcher';
import { UPDATE_ALERT } from '../../../constants/AlertConstants';
import type { State } from '../../../types';

export const ProfileBox = React.createClass({
  propTypes: {
    user: PropTypes.object.isRequired,
  },

  getInitialState() {
    return {
      isSubmitting: false,
      isUpdating: false,
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
    UserActions.sendConfirmSms()
      .then(() => {
        AppDispatcher.dispatch({
          actionType: UPDATE_ALERT,
          alert: {
            bsStyle: 'success',
            content: 'phone.confirm.alert.received',
          },
        });
      })
      .catch(err => {
        let message = err.response.message;
        if (message === 'sms_already_sent_recently') {
          message = <FormattedMessage id="phone.confirm.alert.wait_for_new" />;
        }
        if (message === 'sms_failed_to_send') {
          message = (
            <FormattedMessage id="phone.confirm.alert.failed_to_send" />
          );
        }
        this.setState({
          alert: { type: 'danger', message },
          isSubmitting: false,
        });
      });
  },

  handleAlertDismiss() {
    this.setState({ alert: null });
  },

  askChangeNumber() {
    this.setState(this.getInitialState());
  },

  deletePhone(e) {
    e.preventDefault();
    UserActions.update({ phone: null }).then(() => {
      AppDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: { bsStyle: 'success', content: 'alert.success.delete.phone' },
      });
    });
    this.setState({ isUpdating: true });
    this.form.state.form.phone = '';
  },

  render() {
    const { user } = this.props;
    const { isSubmitting, isUpdating, smsSentToNumber, alert } = this.state;
    const header = smsSentToNumber
      ? <FormattedMessage id="phone.confirm.check_your_phone" />
      : <FormattedMessage id="phone.confirm.phone" />;
    const footer =
      !smsSentToNumber &&
      <Button
        id="confirm-continue"
        onClick={this.handleSubmit}
        disabled={isSubmitting || (user.isPhoneConfirmed && !isUpdating)}
        bsStyle="primary">
        {isSubmitting
          ? <FormattedMessage id="global.loading" />
          : <FormattedMessage id="global.continue" />}
      </Button>;
    return (
      <Panel header={header} footer={footer}>
        {alert &&
          <Alert
            bsStyle={alert.type}
            onDismiss={this.handleAlertDismiss}
            dismissAfter={2000}>
            {alert.message}
          </Alert>}
        {smsSentToNumber &&
          <FormattedHTMLMessage
            id="phone.confirm.sent"
            phone={smsSentToNumber}
          />}
        {!smsSentToNumber &&
          !user.phone &&
          <FormattedHTMLMessage id="phone.confirm.infos" />}
        {smsSentToNumber
          ? <SmsCodeForm onSubmitSuccess={this.onCodeSuccess} />
          : <PhoneForm
              ref={c => (this.form = c)}
              isSubmitting={isSubmitting}
              onSubmit={this.handleSubmit}
              onSubmitFailure={this.stopSubmit}
              onSubmitSuccess={this.onSubmitSuccess}
              initialValue={
                user.isPhoneConfirmed
                  ? user.phone.slice(3, user.phone.length)
                  : null
              }
            />}
        {user.isPhoneConfirmed &&
          !isUpdating &&
          <span style={{ color: '#57AD68' }}>
            {<FormattedMessage id="phone.confirm.ok" />}
            {' - '}
            <Button
              style={{ paddingLeft: 0 }}
              onClick={this.deletePhone}
              bsStyle="link">
              {<FormattedMessage id="phone.ask_delete" />}
            </Button>
          </span>}
        {smsSentToNumber &&
          <span>
            <Button
              style={{ paddingLeft: 0, paddingRight: 0 }}
              onClick={this.resendSmsCode}
              bsStyle="link">
              {<FormattedMessage id="phone.confirm.ask_new" />}
            </Button>
            {' • '}
            <Button
              style={{ paddingLeft: 0 }}
              onClick={this.askChangeNumber}
              bsStyle="link">
              {<FormattedMessage id="phone.confirm.ask_change_number" />}
            </Button>
          </span>}
      </Panel>
    );
  },
});

const mapStateToProps = (state: State) => ({
  user: state.user.user,
});

export default connect(mapStateToProps)(ProfileBox);
