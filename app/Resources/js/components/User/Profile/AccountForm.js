// @flow
import React, { Component } from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Alert } from 'react-bootstrap';
import { reduxForm, Field, type FormProps } from 'redux-form';
import {
  submitAccountForm as onSubmit,
  resendConfirmation,
  cancelEmailChange,
} from '../../../redux/modules/user';
import { isEmail } from '../../../services/Validator';
import renderComponent from '../../Form/Field';
import AlertForm from '../../Alert/AlertForm';
import type { State, Dispatch } from '../../../types';

export const form = 'account';
const validate = (
  values: { email: ?string },
  props: { initialValues: { email: string } },
): { email: ?string } => {
  const errors = {};

  if (!values.email) {
    errors.email = 'global.required';
  } else if (!isEmail(values.email)) {
    errors.email = 'proposal.vote.constraints.email';
  }

  if (values.email === props.initialValues.email) {
    errors.email = 'global.change.required';
  }

  return errors;
};

type Props = {|
  ...FormProps,
  newEmailToConfirm?: ?string,
  initialValues: Object,
  confirmationEmailResent: boolean,
  dispatch: Dispatch,
|};

export class AccountForm extends Component<Props> {
  render() {
    const {
      initialValues,
      dispatch,
      pristine,
      handleSubmit,
      confirmationEmailResent,
      error,
      newEmailToConfirm,
      invalid,
      valid,
      submitSucceeded,
      submitFailed,
      submitting,
    } = this.props;
    return (
      <form onSubmit={handleSubmit} className="form-horizontal" id="profile-account">
        {confirmationEmailResent && (
          <Alert bsStyle="warning">
            <FormattedMessage id="account.email_confirmation_sent" />
          </Alert>
        )}
        <div className="horizontal_field_with_border_top" style={{ border: 0 }}>
          <label className="col-sm-3 control-label" htmlFor="account__email">
            <FormattedMessage id="proposal.vote.form.email" />
          </label>
          <div>
            <Field
              type="email"
              component={renderComponent}
              name="email"
              id="account__email"
              divClassName="col-sm-6"
              style={{ marginLeft: 15 }}
            />
            <span className="small excerpt col-sm-6 col-sm-offset-3" style={{ paddingBottom: 10 }}>
              <i className="icon cap-lock-2" />
              <FormattedMessage id="account.your_email_is_not_public" />
            </span>
          </div>
        </div>
        {newEmailToConfirm && (
          <div className="col-sm-6 col-sm-offset-3">
            <p className="small excerpt">
              <FormattedHTMLMessage
                id="user.confirm.profile_help"
                values={{ email: newEmailToConfirm }}
              />
            </p>
            <p className="small excerpt col-sm-6 col-sm-offset-3">
              <a href="#resend" onClick={() => resendConfirmation()}>
                <FormattedMessage id="user.confirm.resend" />
              </a>
              {' · '}
              <a href="#cancel" onClick={() => cancelEmailChange(dispatch, initialValues.email)}>
                <FormattedMessage id="user.confirm.cancel" />
              </a>
            </p>
          </div>
        )}
        <div className="col-sm-6 col-sm-offset-3" id="profile-alert-form">
          <AlertForm
            valid={pristine ? true : valid}
            invalid={pristine ? false : invalid}
            errorMessage={error}
            submitSucceeded={submitSucceeded}
            submitFailed={submitFailed}
            submitting={submitting}
          />
        </div>
      </form>
    );
  }
}

const mapStateToProps = (state: State) => ({
  newEmailToConfirm: state.user.user && state.user.user.newEmailToConfirm,
  confirmationEmailResent: state.user.confirmationEmailResent,
  initialValues: {
    email: state.user.user && state.user.user.email,
  },
});

export default connect(mapStateToProps)(
  reduxForm({
    form,
    validate,
    onSubmit,
  })(AccountForm),
);
