// @flow
import React, { Component } from 'react';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { connect } from 'react-redux';
import {
  reduxForm,
  Field,
  SubmissionError,
  type FormProps,
  change,
  formValueSelector,
  getFormAsyncErrors,
} from 'redux-form';
import { Panel, ButtonToolbar, Button } from 'react-bootstrap';
import { fetchQuery } from 'react-relay';
import component from '../../Form/Field';
import AlertForm from '../../Alert/AlertForm';
import UpdateProfilePasswordMutation from '../../../mutations/UpdateProfilePasswordMutation';
import type { Dispatch, State } from '../../../types';
import {
  checkPasswordConditions,
  getMatchingPasswordError,
  getPasswordComplexityScore,
} from '../UserPasswordComplexityUtils';
import environment from '../../../createRelayEnvironment';
import UserPasswordField from '../UserPasswordField';

type Props = {|
  ...FormProps,
  intl: IntlShape,
  passwordComplexityScore: number,
  passwordConditions: Object,
  formAsyncErrors: Object,
  dispatch: Dispatch,
|};

type FormValues = {
  email: string,
  new_password: string,
  passwordComplexityScore: number,
  passwordConditions: Object,
};
const formName = 'password-form';

const onSubmit = (values: Object, dispatch: Dispatch, { reset, intl }) => {
  const input = {
    current_password: values.current_password,
    new: values.new_password,
  };
  return UpdateProfilePasswordMutation.commit({ input }).then(response => {
    if (
      !response.updateProfilePassword ||
      !response.updateProfilePassword.user ||
      response.updateProfilePassword.error
    ) {
      if (response.updateProfilePassword && response.updateProfilePassword.error) {
        throw new SubmissionError({
          current_password: response.updateProfilePassword.error,
        });
      } else {
        throw new SubmissionError({
          _error: intl.formatMessage({ id: 'global.error.server.form' }),
        });
      }
    }
    reset();
  });
};

const selector = formValueSelector(formName);

export class ChangePasswordForm extends Component<Props> {
  static defaultProps = {
    passwordComplexityScore: 0,
    passwordConditions: {
      length: false,
      upperLowercase: false,
      digit: false,
    },
    formAsyncErrors: null,
  };

  render() {
    const {
      invalid,
      valid,
      submitSucceeded,
      submitFailed,
      handleSubmit,
      submitting,
      error,
      passwordComplexityScore,
      passwordConditions,
      dispatch,
      formAsyncErrors,
    } = this.props;

    const header = (
      <div className="panel-heading profile-header">
        <h1>
          <FormattedMessage id="modify-password" />
        </h1>
      </div>
    );

    const footer = (
      <div className="col-sm-offset-4">
        <Button
          disabled={invalid || submitting}
          type="submit"
          bsStyle="primary"
          id="profile-password-save">
          <FormattedMessage id={submitting ? 'global.loading' : 'global.save'} />
        </Button>
      </div>
    );

    return (
      <form onSubmit={handleSubmit} className="form-horizontal">
        <Panel id="capco_horizontal_form">
          <Panel.Heading>{header}</Panel.Heading>
          <Panel.Body>
            <h2 className="page-header">
              <FormattedMessage id="form.new_password" />
            </h2>
            <div>
              <div className="horizontal_field_with_border_top" style={{ border: 0 }}>
                <label className="col-sm-3 control-label" htmlFor="password-form-current">
                  <FormattedMessage id="form.current_password" />
                </label>
                <div>
                  <Field
                    type="password"
                    component={component}
                    name="current_password"
                    id="password-form-current"
                    divClassName="col-sm-6"
                  />
                </div>
              </div>
              <div className="clearfix" />
              <div className="horizontal_field_with_border_top" style={{ border: 0 }}>
                <label className="col-sm-3 control-label" htmlFor="password-form-new">
                  <FormattedMessage id="new-password" />
                </label>
                <div>
                  <UserPasswordField
                    passwordComplexityScore={passwordComplexityScore}
                    passwordConditions={passwordConditions}
                    dispatch={dispatch}
                    error={formAsyncErrors ? formAsyncErrors.new_password : null}
                    id="password-form-new"
                    name="new_password"
                    divClassName="col-sm-6"
                  />
                </div>
              </div>
              <div className="clearfix" />
              <div className="horizontal_field_with_border_top" style={{ border: 0 }}>
                <label className="col-sm-3 control-label" htmlFor="password-form-confirmation">
                  <FormattedMessage id="confirm-password" />
                </label>
                <div>
                  <Field
                    type="password"
                    component={component}
                    name="new_password_confirmation"
                    id="password-form-confirmation"
                    divClassName="col-sm-6"
                  />
                </div>
              </div>
              <div className="clearfix" />
              <div className="horizontal_field_with_border_top">
                <div className="col-sm-3" />
                <ButtonToolbar className="col-sm-6 pl-0">
                  <AlertForm
                    valid={valid}
                    invalid={invalid}
                    errorMessage={error}
                    submitSucceeded={submitSucceeded}
                    submitFailed={submitFailed}
                    submitting={submitting}
                  />
                </ButtonToolbar>
              </div>
            </div>
          </Panel.Body>
          <Panel.Footer>{footer}</Panel.Footer>
        </Panel>
      </form>
    );
  }
}

const mapStateToProps = (state: State) => ({
  initialValues: {
    passwordComplexityScore: 0,
    passwordConditions: {
      length: false,
      upperLowercase: false,
      digit: false,
    },
  },
  passwordComplexityScore: selector(state, 'passwordComplexityScore'),
  passwordConditions: selector(state, 'passwordConditions'),
  formAsyncErrors: getFormAsyncErrors(formName)(state),
});

const validate = ({
  current_password,
  new_password,
  new_password_confirmation,
}: {
  current_password: ?string,
  new_password: ?string,
  new_password_confirmation: ?string,
}) => {
  const errors = {};
  if (current_password && current_password.length < 1) {
    errors.current_password = 'fos_user.password.not_current';
  }
  if (new_password && new_password_confirmation && new_password_confirmation !== new_password) {
    errors.new_password_confirmation = 'fos_user.password.mismatch';
  }
  return errors;
};

const asyncValidate = (values: FormValues, dispatch: Dispatch) => {
  const passwordConditions = checkPasswordConditions(values.new_password);
  dispatch(change(formName, 'passwordConditions', passwordConditions));

  const credentialValues = {
    password: values.new_password,
    email: values.email === undefined ? null : values.email,
  };
  return new Promise((resolve, reject) => {
    fetchQuery(environment, getPasswordComplexityScore, credentialValues).then(res => {
      dispatch(
        change(
          formName,
          'passwordComplexityScore',
          res.passwordComplexityScore + (passwordConditions.length ? 1 : 0),
        ),
      );
    });

    const error = getMatchingPasswordError('new_password', passwordConditions);
    if (error) {
      reject(error);
    }
    resolve();
  });
};

const form = reduxForm({
  onSubmit,
  validate,
  asyncValidate,
  asyncChangeFields: ['new_password'],
  enableReinitialize: true,
  form: formName,
})(ChangePasswordForm);

export default connect(mapStateToProps)(injectIntl(form));
