// @flow
import React, { Component } from 'react';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { connect } from 'react-redux';
import { reduxForm, Field, SubmissionError } from 'redux-form';
import { Panel, ButtonToolbar, Button } from 'react-bootstrap';
import styled from 'styled-components';
import component from '../../Form/Field';
import AlertForm from '../../Alert/AlertForm';
import UpdateProfilePasswordMutation from '../../../mutations/UpdateProfilePasswordMutation';
import type { Dispatch } from '../../../types';
import { asyncPasswordValidate } from '../UserPasswordComplexityUtils';
import UserPasswordField from '../UserPasswordField';
import config from '../../../config';

type Props = {|
  ...ReduxFormFormProps,
  intl: IntlShape,
  dispatch: Dispatch,
|};

type FormValues = {|
  email: string,
  current_password: string,
  new_password: string,
  new_password_confirmation: string,
|};

export const formName = 'password-form';

const Container = styled.div`
  .flex-column {
    display: flex;
    flex-direction: column;
  }

  .mtn-10 {
    margin-top: -10px;
  }

  .inline {
    display: block-inline;
  }

  .full-width {
    width: 100%;
  }

  .no-border {
    border: 0;
  }
`;

const onSubmit = (values: Object, dispatch: Dispatch, { reset, intl }) => {
  if (!values.current_password) {
    throw new SubmissionError({
      current_password: intl.formatMessage({ id: 'fos_user.password.not_current' }),
    });
  }
  if (!values.new_password && !values.new_password_confirmation) {
    throw new SubmissionError({
      new_password: intl.formatMessage({ id: 'fos_user.new_password.blank' }),
    });
  }
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
            <Container>
              <div className="flex-column">
                <div className="horizontal_field_with_border_top no-border">
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

                <div className="mb-10 mtn-10">
                  <div className="col-sm-3" />
                  <a href="/resetting/request">
                    <FormattedMessage id="global.forgot_password" />
                  </a>
                </div>

                <div className="clearfix" />
                <div className="horizontal_field_with_border_top no-border">
                  <label className="col-sm-3 control-label" htmlFor="password-form-new">
                    <FormattedMessage id="new-password" />
                  </label>
                  <div>
                    <UserPasswordField
                      formName={formName}
                      id="password-form-new"
                      name="new_password"
                      divClassName={`col-sm-6 inline ${config.isMobile ? 'full-width' : ''}`}
                    />
                  </div>
                </div>
                <div className="clearfix" />
                <div className="horizontal_field_with_border_top no-border">
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
            </Container>
          </Panel.Body>
          <Panel.Footer>{footer}</Panel.Footer>
        </Panel>
      </form>
    );
  }
}

export const validate = (values: FormValues) => {
  const errors = {};
  if (!values.new_password && !values.new_password_confirmation) {
    return {};
  }
  if (!values.current_password || values.current_password.length < 1) {
    errors.current_password = 'fos_user.password.not_current';
  }
  if (!values.new_password || values.new_password.length < 1) {
    errors.new_password = 'at-least-8-characters-one-digit-one-uppercase-one-lowercase';
  }
  if (!values.new_password_confirmation || values.new_password_confirmation.length < 1) {
    errors.new_password_confirmation = 'fos_user.password.mismatch';
  }
  if (
    values.new_password &&
    values.new_password_confirmation &&
    values.new_password_confirmation !== values.new_password
  ) {
    errors.new_password_confirmation = 'fos_user.password.mismatch';
  }
  return errors;
};

const asyncValidate = (values: FormValues, dispatch: Dispatch) => {
  if (!values.new_password && !values.new_password_confirmation) {
    return new Promise(resolve => {
      resolve();
    });
  }
  if (!values.new_password) {
    return new Promise((resolve, reject) => {
      const error = {};
      error.new_password = 'at-least-8-characters-one-digit-one-uppercase-one-lowercase';
      reject(error);
    });
  }
  return asyncPasswordValidate(formName, 'new_password', values, dispatch);
};

const form = reduxForm({
  onSubmit,
  validate,
  asyncValidate,
  asyncChangeFields: ['new_password'],
  enableReinitialize: true,
  form: formName,
})(ChangePasswordForm);

export default connect()(injectIntl(form));
