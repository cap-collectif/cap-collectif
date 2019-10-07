// @flow
import * as React from 'react';
import { type IntlShape, injectIntl, FormattedMessage } from 'react-intl';
import { reduxForm, Field, SubmissionError } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { ButtonToolbar, Button } from 'react-bootstrap';
import type { Dispatch, State } from '../../../types';
import type { UserAdminPassword_user } from '~relay/UserAdminPassword_user.graphql';
import component from '../../Form/Field';
import AlertForm from '../../Alert/AlertForm';
import UpdateProfilePasswordMutation from '../../../mutations/UpdateProfilePasswordMutation';
import { asyncPasswordValidate } from '~/components/User/UserPasswordComplexityUtils';

type RelayProps = {| user: UserAdminPassword_user |};
type Props = {|
  ...ReduxFormFormProps,
  ...RelayProps,
  intl: IntlShape,
|};
type FormValues = {
  current_password: string,
  new_password: string,
};

const formName = 'user-admin-edit-password';

const validate = (values: FormValues) => {
  const errors = {};
  if (values.current_password && values.current_password.length < 1) {
    errors.current_password = 'fos_user.password.not_current';
  }
  if (values.new_password && values.new_password.length < 1) {
    errors.new_password = 'at-least-8-characters-one-digit-one-uppercase-one-lowercase';
  }
  return errors;
};

const asyncValidate = (values: FormValues, dispatch: Dispatch) => {
  return asyncPasswordValidate(formName, 'new_password', values, dispatch);
};

const onSubmit = (values: FormValues, dispatch: Dispatch, { reset, intl }) => {
  const input = {
    current_password: values.current_password,
    new_password: values.new_password,
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

export class UserAdminPassword extends React.Component<Props, State> {
  render() {
    const {
      invalid,
      valid,
      submitSucceeded,
      submitFailed,
      handleSubmit,
      submitting,
      error,
      user,
    } = this.props;
    return (
      <div className="box box-primary container-fluid">
        <h2 className="page-header">
          <FormattedMessage id="user.profile.edit.password" />
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="box-content box-content__content-form">
            <Field
              type="password"
              component={component}
              name="current_password"
              id="password-form-current"
              divClassName="col-sm-6"
              label={<FormattedMessage id="form.current_password" />}
              disabled={!user.isViewer}
            />
            <div className="clearfix" />
            <Field
              type="password"
              component={component}
              name="new_password"
              id="password-form-new_password"
              divClassName="col-sm-6"
              label={<FormattedMessage id="new-password-admin" />}
              disabled={!user.isViewer}
            />
            <div className="clearfix" />
            <div className="clearfix" />
            <ButtonToolbar className="col-sm-6 pl-0">
              <Button
                disabled={invalid || submitting || !user.isViewer}
                type="submit"
                bsStyle="primary"
                id="user-admin-password-save">
                <FormattedMessage
                  id={submitting ? 'global.loading' : 'global.save_modifications'}
                />
              </Button>
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
        </form>
      </div>
    );
  }
}

const form = reduxForm({
  onSubmit,
  validate,
  asyncValidate,
  enableReinitialize: true,
  form: formName,
})(UserAdminPassword);

const container = injectIntl(form);

export default createFragmentContainer(container, {
  user: graphql`
    fragment UserAdminPassword_user on User {
      id
      isViewer
    }
  `,
});
