// @flow
import * as React from 'react';
import {type IntlShape, injectIntl, FormattedMessage} from 'react-intl';
import {reduxForm, type FormProps, Field, SubmissionError} from 'redux-form';
import {createFragmentContainer, graphql} from 'react-relay';
import {ButtonToolbar, Button} from 'react-bootstrap';
import type {Dispatch, State} from '../../../types';
import component from '../../Form/Field';
import AlertForm from '../../Alert/AlertForm';
import UpdateProfilePasswordMutation from '../../../mutations/UpdateProfilePasswordMutation';
import UserAdminPassword_user from './__generated__/UserAdminPassword_user.graphql';

type RelayProps = { user: UserAdminPassword_user };
type Props = FormProps &
  RelayProps & {
  intl: IntlShape,
};

const formName = 'user-admin-edit-password';

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

const onSubmit = (values: Object, dispatch: Dispatch,props: Props, {reset, intl}) => {
  const input = {
    current_password: values.current_password,
    new: values.new_password,
    userId: props.user.id
  };
  return UpdateProfilePasswordMutation.commit({input}).then(response => {
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
          _error: intl.formatMessage({id: 'global.error.server.form'}),
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
          <FormattedMessage id="user.profile.edit.password"/>
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="box-content box-content__content-form">
            <Field
              type="password"
              component={component}
              name="current_password"
              id="password-form-current"
              divClassName="col-sm-6"
              label={<FormattedMessage id="form.current_password"/>}
              disabled={!user.isUserOrSuperAdmin}
            />
            <div className="clearfix"/>
            <Field
              type="password"
              component={component}
              name="new_password"
              id="password-form-new_password"
              divClassName="col-sm-6"
              label={<FormattedMessage id="form.new_password"/>}
              disabled={!user.isUserOrSuperAdmin}
            />
            <div className="clearfix"/>
            <Field
              type="password"
              component={component}
              name="new_password_confirmation"
              id="password-form-confirmation"
              divClassName="col-sm-6"
              label={<FormattedMessage id="form.new_password_confirmation"/>}
              disabled={!user.isUserOrSuperAdmin}
            />
            <div className="clearfix"/>
            <ButtonToolbar className="col-sm-6 pl-0">
              <Button
                disabled={invalid || submitting || !user.isUserOrSuperAdmin}
                type="submit"
                bsStyle="primary"
                id="profile-password-save">
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
  enableReinitialize: true,
  form: formName,
})(UserAdminPassword);


export default createFragmentContainer(
  injectIntl(form),
  graphql`
  fragment UserAdminPassword_user on User {
    id
    isUserOrSuperAdmin
  }`,
);