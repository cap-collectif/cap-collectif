/**
 * @flow
 */
import React, { Component } from 'react';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import { reduxForm, formValueSelector, Field, FieldArray, type FormProps } from 'redux-form';
import { Panel, Col, Row, Glyphicon, ButtonToolbar, Button } from 'react-bootstrap';
import SubmitButton from '../../Form/SubmitButton';
import component from '../../Form/Field';
import UpdateProfilePasswordMutation from '../../../mutations/UpdateProfilePasswordMutation';
import type {FeatureToggles} from "../../../types";
import {ProposalFormAdminConfigurationForm} from "../../ProposalForm/ProposalFormAdminConfigurationForm";

type Props =   FormProps & {
  intl: IntlShape,
  usingAddress: boolean,
  usingCategories: boolean,
  usingThemes: boolean,
  usingDistrict: boolean,
  features: FeatureToggles,
};

const formName = 'profile-change-password';
const onSubmit = (values: Object) => {
  return UpdateProfilePasswordMutation.commit({
    input: {
      currentPassword: values.current_password,
      new: values.new_password
    }
  }).then(() => {
    window.location.reload();
    return true;
  });
};

const validate = ({current_password, new_password, new_password_confirmation}: { current_password: ?string,new_password: ?string, new_password_confirmation: ?string }) => {
  const errors = {};
  if (!current_password) {
    errors.no_current = 'fos_user.password.not_current';
  }
  if (!new_password || new_password < 8 || !new_password_confirmation || new_password !== new_password_confirmation) {
    errors.mismatch = 'fos_user.password.mismatch';
  }
  return errors;
};
export class ChangePasswordForm extends Component<Props> {
  // handleChange(event) {
  //   const target = event.target;
  //   const value = target.value;
  //   const name = target.name;
  //
  //   this.setState({
  //     [name]: value
  //   });
  // }
  // handleSubmit(event) {
  //   return UpdateProfilePasswordMutation.commit({
  //     input: {
  //       currentPassword: this.state.current_password,
  //       new: this.state.new_password
  //     }
  //   }).then(() => {
  //     window.location.reload();
  //     event.preventDefault();
  //     return true;
  //   });
  // }

  render() {
    const { submitting, handleSubmit, submit } = this.props;

    return (
      <form onSubmit={handleSubmit}>
        <Field
          type="password"
          component={component}
          name="current_password"
          label={<FormattedMessage id="form.current_password"/>}

        />
        <Field
          type="password"
          component={component}
          name="new_password"
          label={<FormattedMessage id="form.new_password"/>}
        />
        <Field
          type="password"
          component={component}
          name="new_password_confirmation"
          label={<FormattedMessage id="form.new_password_confirmation"/>}
        />
        <SubmitButton
          id="confirm-proposalform-create"
          isSubmitting={submitting}
          onSubmit={() => {
            submit(formName);
          }}
        />
      </form>
    );
  }
}

export default reduxForm({
  onSubmit,
  validate,
  enableReinitialize: true,
  form: formName,
})(ChangePasswordForm);
