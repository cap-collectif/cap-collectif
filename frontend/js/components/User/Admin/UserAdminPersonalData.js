// @flow
import * as React from 'react';
import { type IntlShape, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { reduxForm, Field, SubmissionError } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { ButtonToolbar, Button } from 'react-bootstrap';
import type { Dispatch, State } from '~/types';
import type { UserAdminPersonalData_user } from '~relay/UserAdminPersonalData_user.graphql';
import type { UserAdminPersonalData_viewer } from '~relay/UserAdminPersonalData_viewer.graphql';
import component from '../../Form/Field';
import DateDropdownPicker from '../../Form/DateDropdownPicker';
import AlertForm from '../../Alert/AlertForm';
import UpdateProfilePersonalDataMutation from '~/mutations/UpdateProfilePersonalDataMutation';
import DatesInterval from '../../Utils/DatesInterval';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';

type RelayProps = {| user: UserAdminPersonalData_user, viewer: UserAdminPersonalData_viewer |};
type GenderValue = 'FEMALE' | 'MALE' | 'OTHER';
type FormValue = {|
  address: string,
  address2: string,
  city: string,
  zipCode: string,
  firstname: string,
  lastname: string,
  email: string,
  phone: string,
  userIdentificationCode: string,
  isEmailConfirmed: boolean,
  phoneConfirmed: boolean,
  gender: GenderValue,
  dateOfBirth: string,
|};
type Props = {|
  ...ReduxFormFormProps,
  ...RelayProps,
  intl: IntlShape,
  // initialValues: FormValue,
  isViewer: boolean,
  isSuperAdmin: boolean,
|};

const formName = 'user-admin-edit-personal-data';

const validate = (values: Object) => {
  const errors = {};
  const fields = [
    'address',
    'address2',
    'city',
    'zipCode',
    'firstname',
    'lastname',
    'phone',
    'email',
  ];
  fields.forEach(value => {
    if (values[value] && values[value].length <= 2) {
      errors[value] = 'two-characters-minimum-required';
    }
    if (values[value] && values[value].length > 256) {
      errors[value] = '256-characters-maximum-required';
    }
  });

  return errors;
};

const onSubmit = (values: FormValue, dispatch: Dispatch, props: Props) => {
  const userId = props.user.id;
  const { isEmailConfirmed, ...rest } = values;
  const input = {
    ...rest,
    userId,
  };

  return UpdateProfilePersonalDataMutation.commit({ input })
    .then(response => {
      if (!response.updateProfilePersonalData || !response.updateProfilePersonalData.user) {
        throw new Error('Mutation "updateProfilePersonalData" failed.');
      }
      if (response.updateProfilePersonalData?.errorCode) {
        mutationErrorToast(props.intl);
      }
    })
    .catch(response => {
      if (response.response?.message) {
        throw new SubmissionError({
          _error: response.response.message,
        });
      } else {
        throw new SubmissionError({
          _error: props.intl.formatMessage({ id: 'global.error.server.form' }),
        });
      }
    });
};

export const UserAdminPersonalData = ({
  invalid,
  valid,
  submitSucceeded,
  submitFailed,
  handleSubmit,
  submitting,
  error,
  isSuperAdmin,
  isViewer,
  user,
  intl,
}: Props) => {
  const isViewerOrSuperAdmin = isViewer || isSuperAdmin;

  return (
    <div className="box box-primary container-fluid">
      <h2 className="page-header">
        <FormattedMessage id="personal-data" />
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="box-content box-content__content-form">
          <Field
            id="personal-data-email"
            name="email"
            label={<FormattedMessage id="share.mail" />}
            component={component}
            type="text"
            divClassName="col-sm-4"
            disabled={!isViewerOrSuperAdmin}
          />
          <div className="clearfix" />
          <Field
            id="isEmailConfirmed"
            name="isEmailConfirmed"
            component={component}
            isReduxForm
            type="checkbox"
            disabled
            divClassName="col-sm-4">
            <div>
              <FormattedMessage id="confirmed-by-email" />
              &nbsp;
              <DatesInterval startAt={user.emailConfirmationSentAt} />
            </div>
          </Field>
          <div className="clearfix" />
          <Field
            name="firstname"
            label={<FormattedMessage id="form.label_firstname" />}
            component={component}
            type="text"
            id="personal-data-form-firstname"
            divClassName="col-sm-4"
            disabled={!isViewerOrSuperAdmin}
          />
          <div className="clearfix" />
          <Field
            id="personal-data-form-lastname"
            name="lastname"
            component={component}
            type="text"
            divClassName="col-sm-4"
            disabled={!isViewerOrSuperAdmin}
            label={<FormattedMessage id="global.name" />}
          />
          <div className="clearfix" />
          <Field
            name="gender"
            component={component}
            label={<FormattedMessage id="form.label_gender" />}
            type="select"
            id="personal-data-form-gender"
            disabled={!isViewerOrSuperAdmin}
            divClassName="col-sm-4">
            <option value="">{intl.formatMessage({ id: 'global.select' })}</option>
            <option value="MALE">{intl.formatMessage({ id: 'gender.male' })}</option>
            <option value="FEMALE">{intl.formatMessage({ id: 'global.female' })}</option>
            <option value="OTHER">{intl.formatMessage({ id: 'global.plural.other' })}</option>
          </Field>
          <div className="clearfix" />
          <Field
            name="dateOfBirth"
            id="dateOfBirth"
            disabled={!isViewerOrSuperAdmin}
            component={DateDropdownPicker}
            dayId="personal-data-date-of-birth-day"
            monthId="personal-data-date-of-birth-month"
            yearId="personal-data-date-of-birth-year"
            label={<FormattedMessage id="form.label_date_of_birth" />}
            componentId="personal-data-date-of-birth"
            globalClassName="col-sm-4 form-group"
          />
          <div className="clearfix" />
          <Field
            name="address"
            component={component}
            type="text"
            disabled={!isViewerOrSuperAdmin}
            id="personal-data-form-address"
            label={<FormattedMessage id="form.label_address" />}
            divClassName="col-sm-4"
          />
          <div className="clearfix" />
          <Field
            name="address2"
            component={component}
            type="text"
            disabled={!isViewerOrSuperAdmin}
            id="personal-data-form-address2"
            divClassName="col-sm-4"
            label={<FormattedMessage id="form.label_address2" />}
          />
          <div className="clearfix" />
          <Field
            id="city"
            name="city"
            component={component}
            type="text"
            disabled={!isViewerOrSuperAdmin}
            label={<FormattedMessage id="form.label_city" />}
            divClassName="col-sm-4"
          />
          <div className="clearfix" />
          <Field
            id="zipCode"
            name="zipCode"
            component={component}
            type="text"
            disabled={!isViewerOrSuperAdmin}
            label={<FormattedMessage id="form.label_zip_code" />}
            divClassName="col-sm-4"
          />
          <div className="clearfix" />
          <Field
            id="phone"
            name="phone"
            component={component}
            type="text"
            disabled={!isViewerOrSuperAdmin}
            label={<FormattedMessage id="form.label_phone" />}
            divClassName="col-sm-4"
          />
          <div className="clearfix" />
          <Field
            id="phoneConfirmed"
            name="phoneConfirmed"
            component={component}
            type="checkbox"
            disabled
            divClassName="col-sm-4">
            <FormattedMessage id="form.label_phone_confirmed" />
          </Field>
          <div className="clearfix" />
          <Field
            id="userIdentificationCode"
            name="userIdentificationCode"
            component={component}
            type="text"
            disabled={!isSuperAdmin}
            label={<FormattedMessage id="identification_code" />}
            divClassName="col-sm-4"
          />
          <div className="clearfix" />
          <ButtonToolbar className="box-content__toolbar">
            <Button
              disabled={invalid || submitting || !isViewerOrSuperAdmin}
              type="submit"
              bsStyle="primary"
              id="user-admin-personal-data-save">
              <FormattedMessage id={submitting ? 'global.loading' : 'global.save_modifications'} />
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
};

const form = reduxForm({
  onSubmit,
  validate,
  enableReinitialize: true,
  form: formName,
})(UserAdminPersonalData);

const mapStateToProps = (state: State, { user, viewer }: RelayProps) => ({
  initialValues: {
    email: user.email ? user.email : null,
    firstname: user.firstname ? user.firstname : null,
    lastname: user.lastname ? user.lastname : null,
    gender: user.gender ? user.gender : null,
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth : null,
    address: user.address ? user.address : null,
    address2: user.address2 ? user.address2 : null,
    city: user.city ? user.city : null,
    zipCode: user.zipCode ? user.zipCode : null,
    phone: user ? user.phone : null,
    phoneConfirmed: user ? user.phoneConfirmed : null,
    isEmailConfirmed: user ? user.isEmailConfirmed : null,
    userIdentificationCode: user ? user.userIdentificationCode : null,
  },
  isViewer: user.isViewer,
  isSuperAdmin: viewer.isSuperAdmin,
});

const container = connect<any, any, _, _, _, _>(mapStateToProps)(form);

// same as PersonalData.js I have to find a solution to merge both in one
export default createFragmentContainer(container, {
  user: graphql`
    fragment UserAdminPersonalData_user on User {
      id
      email
      isEmailConfirmed
      emailConfirmationSentAt
      firstname
      lastname
      gender
      dateOfBirth
      address
      address2
      city
      zipCode
      phone
      phoneConfirmed
      userIdentificationCode
      isViewer
    }
  `,
  viewer: graphql`
    fragment UserAdminPersonalData_viewer on User {
      isSuperAdmin
    }
  `,
});
