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
  if (!current_password) {
    errors.current_password = 'fos_user.password.not_current';
  }
  if (!new_password) {
    errors.new_password = 'fos_user.password.mismatch';
  }
  if (new_password && new_password.length < 8) {
    errors.new_password = 'fos_user.new_password.short';
  }
  if (!new_password_confirmation) {
    errors.new_password_confirmation = 'fos_user.password.mismatch';
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
  return UpdateProfilePasswordMutation.commit({ input })
    .then(response => {
      if (!response.updateProfilePassword || !response.updateProfilePassword.viewer) {
        throw new Error('Mutation "updateProfilePassword" failed.');
      }
      reset();
    })
    .catch(response => {
      if (response.response.message) {
        throw new SubmissionError({
          _error: response.response.message,
        });
      } else {
        throw new SubmissionError({
          _error: intl.formatMessage({ id: 'global.error.server.form' }),
        });
      }
    });
};

export class ChangePasswordForm extends Component<Props> {
  render() {
    const {
      invalid,
      valid,
      submitSucceeded,
      submitFailed,
      pristine,
      handleSubmit,
      submitting,
      error,
    } = this.props;

    return (
      <Panel id="capco_horizontal_form">
        <h2 className="page-header">
          <FormattedMessage id="form.new_password" />
        </h2>
        <form onSubmit={handleSubmit} className="form-horizontal">
          <div>
            <div className="capco_horizontal_field_with_border_top" style={{ border: 0 }}>
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
            <div className="capco_horizontal_field_with_border_top" style={{ border: 0 }}>
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
            <div className="capco_horizontal_field_with_border_top" style={{ border: 0 }}>
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
            <div className="capco_horizontal_field_with_border_top">
              <div className="col-sm-3" />
              <ButtonToolbar className="col-sm-6 pl-0">
                <Button
                  disabled={invalid || pristine || submitting}
                  type="submit"
                  bsStyle="primary"
                  id="profile-password-save">
                  <FormattedMessage
                    id={submitting ? 'global.loading' : 'global.save_modifications'}
                  />
                </Button>
                <AlertForm
                  valid={pristine ? true : valid}
                  invalid={pristine ? false : invalid}
                  errorMessage={error}
                  submitSucceeded={submitSucceeded}
                  submitFailed={submitFailed}
                  submitting={submitting}
                />
              </ButtonToolbar>
            </div>
          </div>
        </form>
      </Panel>
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
