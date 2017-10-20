// flow to add
import * as React from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { reduxForm, Field, SubmissionError } from 'redux-form';
import { Button, Panel, Alert } from 'react-bootstrap';
import { connect } from 'react-redux';
import AppDispatcher from '../../../dispatchers/AppDispatcher';
import { UPDATE_ALERT } from '../../../constants/AlertConstants';
import renderComponent from '../../Form/Field';
import UserActions from '../../../actions/UserActions';
import type { Dispatch } from '../../../types';

type Props = {
  user: Object,
  initialValue: ?string, // n° ou null
  pristine: boolean,
  submitting: boolean,
  handleSubmit: Function,
};

type State = {
  alert: boolean,
};

const onSubmit = (values: { phone: string }, dispatch: Dispatch, state: State, props: Props) => {
  const { onSubmitSuccess, onSubmitFailure } = props;

  return UserActions.update(values)
    .then(() => {
      UserActions.sendConfirmSms()
        .then(() => {
          onSubmitSuccess(values); // à remplacer pas un dispatch(() => {smsSentToNumberAction})
        })
        .catch(error => {
          if (error.response.message === 'sms_failed_to_send') {
            throw new SubmissionError({ phone: 'phone.confirm.alert.failed_to_send' });
          }
          if (error.response.message === 'sms_already_sent_recently') {
            throw new SubmissionError({ phone: 'phone.confirm.alert.wait_for_new' });
          }
          onSubmitFailure();
        });
    })
    .catch(error => {
      if (
        error.response.errors.children.phone.errors &&
        error.response.errors.children.phone.errors.length > 0
      ) {
        if (error.response.errors.children.phone.errors[0] === 'already_used_phone') {
          throw new SubmissionError({ phone: 'profile.constraints.phone.already_used' });
        } else {
          throw new SubmissionError({ phone: 'profile.constraints.phone.invalid' });
        }
      }
      onSubmitFailure();
    });
};

const validate = ({ phone }: Object) => {
  const errors = {};

  if (!phone || phone.length === 0) {
    errors.phone = 'global.constraints.notBlank';
  }

  return errors;
};

const normalizePhone = (values: { phone: string }) => {
  const onlyNums = values.replace(/[^\d]/g, '');

  if (values.length > 9) {
    return onlyNums.slice(0, 9);
  }

  return onlyNums;
};

export const formName = 'PhoneForm';

export class PhoneForm extends React.Component<Props> {
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
          message = <FormattedMessage id="phone.confirm.alert.failed_to_send" />;
        }
        this.setState({
          alert: { type: 'danger', message },
        });
      });
  }

  deletePhone(e) {
    e.preventDefault();
    UserActions.update({ phone: null }).then(() => {
      AppDispatcher.dispatch({
        actionType: UPDATE_ALERT,
        alert: { bsStyle: 'success', content: 'alert.success.delete.phone' },
      });
    });
    // this.setState({ isUpdating: true });
  }

  handleAlertDismiss() {
    this.setState({ alert: null });
  }

  render() {
    const { handleSubmit, submitting, pristine, user } = this.props;
    const { alert } = this.state;

    const header = user.isPhoneConfirm ? (
      <FormattedMessage id="phone.confirm.check_your_phone" />
    ) : (
      <FormattedMessage id="phone.confirm.phone" />
    );

    let footer; // header et footer à faire passer dans le composant parent

    // condition pour sms déjà envoyé

    if (user) {
      footer = (
        <span>
          <Button
            style={{ paddingLeft: 0, paddingRight: 0 }}
            onClick={this.resendSmsCode}
            bsStyle="link">
            {<FormattedMessage id="phone.confirm.ask_new" />}
          </Button>
          {' • '}
          <Button style={{ paddingLeft: 0 }} onClick={this.askChangeNumber} bsStyle="link">
            {<FormattedMessage id="phone.confirm.ask_change_number" />}
          </Button>
        </span>
      );
    } else {
      footer = (
        <Button
          id="confirm-continue"
          onClick={this.handleSubmit}
          type="submit"
          form={formName}
          disabled={submitting || user.isPhoneConfirmed} // (user.isPhoneConfirmed && !isUpdating)
          bsStyle="primary">
          {submitting ? (
            <FormattedMessage id="global.loading" />
          ) : (
            <FormattedMessage id="global.continue" />
          )}
        </Button>
      );
    }

    return (
      <Panel header={header} footer={footer}>
        {alert && (
          <Alert bsStyle={alert.type} onDismiss={this.handleAlertDismiss} dismissAfter={2000}>
            {alert.message}
          </Alert>
        )}
        {!user.phone && <FormattedHTMLMessage id="phone.confirm.infos" />}
        <form style={{ maxWidth: '350px' }} onSubmit={handleSubmit}>
          <Field
            type="text"
            addonBefore="+33"
            component={renderComponent}
            autoFocus
            name="phone"
            id="_phone"
            normalize={normalizePhone}
            props={{ disabled: !!pristine }}
            label={<FormattedMessage id="global.phone" />}
          />
        </form>
        {user.isPhoneConfirmed && ( // !isUpdating &&
          <span style={{ color: '#57AD68' }}>
            {<FormattedMessage id="phone.confirm.ok" />}
            {' - '}
            <Button style={{ paddingLeft: 0 }} onClick={this.deletePhone} bsStyle="link">
              {<FormattedMessage id="phone.ask_delete" />}
            </Button>
          </span>
        )}
      </Panel>
    );
  }
}

const mapStateToProps = (state, props: Props) => ({
  initialValues: {
    phone: props.initialValue,
  },
  // smsSentToNumber: state.yolo.smsSentToNumber,
});

export default connect(mapStateToProps)(
  reduxForm({
    validate,
    onSubmit,
    form: formName,
  })(PhoneForm),
);
