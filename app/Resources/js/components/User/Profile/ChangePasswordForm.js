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
    errors.new_password = 'fos_user.password.mismatch';
  }
  if (!new_password_confirmation) {
    errors.new_password_confirmation = 'fos_user.password.mismatch';
  }
  if (new_password !== new_password_confirmation) {
    errors.mismatch = 'fos_user.password.mismatch';
  }
  return errors;
};

const onSubmit = (values: Object, dispatch: Dispatch, props: Props) => {
  const { intl } = props;

  const input = {
    current_password: values.current_password,
    new: values.new_password,
  };
  return UpdateProfilePasswordMutation.commit({ input })
    .then(response => {
      if (!response.updateProfilePassword || !response.updateProfilePassword.viewer) {
        throw new Error('Mutation "updateProfilePassword" failed.');
      }
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
      <Panel>
        <form onSubmit={handleSubmit}>
          <Field
            type="password"
            component={component}
            name="current_password"
            label={<FormattedMessage id="form.current_password" />}
          />
          <Field
            type="password"
            component={component}
            name="new_password"
            label={<FormattedMessage id="form.new_password" />}
          />
          <Field
            type="password"
            component={component}
            name="new_password_confirmation"
            label={<FormattedMessage id="form.new_password_confirmation" />}
          />
          <ButtonToolbar className="box-content__toolbar">
            <Button
              disabled={invalid || pristine || submitting}
              type="submit"
              bsStyle="primary"
              id="proposal-form-admin-content-save">
              <FormattedMessage id={submitting ? 'global.loading' : 'global.save'} />
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
