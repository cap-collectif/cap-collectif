/**
 * @flow
 */
import React, { Component } from 'react';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { reduxForm, Field, SubmissionError, type FormProps } from 'redux-form';
import { Panel, ButtonToolbar, Button } from 'react-bootstrap';
import component from '../../Form/Field';
import AlertForm from '../../Alert/AlertForm';
import UpdateProfilePasswordMutation from '../../../mutations/UpdateProfilePasswordMutation';
import type { Dispatch } from '../../../types';

type Props = FormProps & { intl: IntlShape };

const formName = 'profileChangePassword';

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
  if (new_password && new_password.length < 8) {
    errors.new_password = 'fos_user.new_password.short';
  }
  if (new_password && new_password_confirmation && new_password_confirmation !== new_password) {
    errors.new_password_confirmation = 'fos_user.password.mismatch';
  }
  return errors;
};

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

export class ChangePasswordForm extends Component<Props> {
  render() {
    const {
      invalid,
      valid,
      submitSucceeded,
      submitFailed,
      handleSubmit,
      submitting,
      error,
    } = this.props;

    const header = (
      <div className="panel-heading profile-header">
        <h1>
          <FormattedMessage id="user.profile.edit.password" />
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
          <FormattedMessage id={submitting ? 'global.loading' : 'global.save_modifications'} />
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
                  <FormattedMessage id="form.new_password" />
                </label>
                <div>
                  <Field
                    type="password"
                    component={component}
                    name="new_password"
                    id="password-form-new"
                    divClassName="col-sm-6"
                  />
                </div>
              </div>
              <div className="clearfix" />
              <div className="horizontal_field_with_border_top" style={{ border: 0 }}>
                <label className="col-sm-3 control-label" htmlFor="password-form-confirmation">
                  <FormattedMessage id="form.new_password_confirmation" />
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

const form = reduxForm({
  onSubmit,
  validate,
  enableReinitialize: true,
  form: formName,
})(ChangePasswordForm);

export default injectIntl(form);
