// @flow
import * as React from 'react';
import {type IntlShape, injectIntl, FormattedMessage} from 'react-intl';
import {connect, type MapStateToProps} from 'react-redux';
import {reduxForm, type FormProps, Field, SubmissionError} from 'redux-form';
import {createFragmentContainer, graphql} from 'react-relay';
import {ButtonToolbar, Button} from 'react-bootstrap';
import type {Dispatch, State} from '../../../types';
import component from '../../Form/Field';
import DateDropdownPicker from '../../Form/DateDropdownPicker';
import AlertForm from '../../Alert/AlertForm';
import UpdateProfilePersonalDataMutation from '../../../mutations/UpdateProfilePersonalDataMutation';
import UserAdminPersonalData_user from './__generated__/UserAdminPersonalData_user.graphql';
import config from "../../../config";

type RelayProps = { user: UserAdminPersonalData_user };
type Props = FormProps &
  RelayProps & {
  intl: IntlShape,
  initialValues: Object,
};

const formName = 'user-admin-edit-personal-data';

const validate = (values: Object) => {
  const errors = {};
  const addressFields = ['address', 'address2', 'city', 'zipCode', 'firstname', 'lastname', 'phone', 'email'];
  addressFields.forEach(value => {
    if (values[value] && values[value].length <= 2) {
      errors[value] = 'two-characters-minimum-required';
    }
    if (values[value] && values[value].length > 256) {
      errors[value] = '256-characters-maximum-required';
    }
  });

  return errors;
};
let wLocale = 'fr-FR';

if (config.canUseDOM && window.locale) {
  wLocale = window.locale;
} else if (!config.canUseDOM) {
  wLocale = global.locale;
}

const onSubmit = (values: Object, dispatch: Dispatch, props: Props) => {
  const {intl} = props;
  const input = {
    ...values,
  };

  return UpdateProfilePersonalDataMutation.commit({input})
    .then(response => {
      if (!response.updateProfilePersonalData || !response.updateProfilePersonalData.user) {
        throw new Error('Mutation "updateProfilePersonalData" failed.');
      }
    })
    .catch(response => {
      if (response.response.message) {
        throw new SubmissionError({
          _error: response.response.message,
        });
      } else {
        throw new SubmissionError({
          _error: intl.formatMessage({id: 'global.error.server.form'}),
        });
      }
    });
};

type PersonalDataState = {
  year: ?number,
  month: ?number,
  day: ?number,
};

export class UserAdminPersonalData extends React.Component<Props, PersonalDataState> {
  render() {
    const {
      invalid,
      valid,
      pristine,
      dirty,
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
          <FormattedMessage id="user.PersonalData.show.jumbotron"/>
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="box-content box-content__content-form">
            <Field
              id="personal-data-email"
              name="email"
              label={<FormattedMessage id="form.label_email"/>}
              component={component}
              type="text"
              divClassName="col-sm-10"
              disabled={!user.isUserOrSuperAdmin}
            />
            <Field
              name="firstname"
              label={
                <FormattedMessage id="registration.firstname"/>
              }
              component={component}
              required
              type="text"
              id="personal-data-form-firstname"
              divClassName="col-sm-4"
              disabled={!user.isUserOrSuperAdmin}
            />
            <div className="clearfix"/>
            <Field
              id="personal-data-form-lastname"
              name="lastname"
              component={component}
              type="text"
              divClassName="col-sm-4"
              disabled={!user.isUserOrSuperAdmin}
              label={<FormattedMessage id="registration.lastname"/>}
            />
            <div className="clearfix"/>
            <Field
              name="gender"
              component={component}
              type="select"
              id="personal-data-form-gender"
              divClassName="col-sm-4">
              <option value="MALE">
                <FormattedMessage id="gender.male"/>
              </option>
              <option value="FEMALE">
                <FormattedMessage id="gender.female"/>
              </option>
              <option value="OTHER">
                <FormattedMessage id="gender.other"/>
              </option>
            </Field>
            <div className="clearfix"/>
            <Field
              name={`dateOfBirth`}
              id="dateOfBirth"
              component={DateDropdownPicker}
              locale={wLocale}
              dayDefaultValue="Jour"
              monthDefaultValue="Mois"
              yearDefaultValue="Année"
              dayId="personal-data-date-of-birth-day"
              monthId="personal-data-date-of-birth-month"
              yearId="personal-data-date-of-birth-year"
              label="form.label_date_of_birth"
              componentId="personal-data-date-of-birth"
              labelClassName="col-sm-3 control-label"
              divClassName="col-sm-6"
            />
            <div className="clearfix"/>
            <Field
              name="address"
              component={component}
              type="text"
              disabled={!user.isUserOrSuperAdmin}
              id="personal-data-form-address"
              label={<FormattedMessage id="form.label_address"/>}
              divClassName="col-sm-4"
            />
            <div className="clearfix"/>
            <Field
              name="address2"
              component={component}
              type="text"
              disabled={!user.isUserOrSuperAdmin}
              id="personal-data-form-address2"
              divClassName="col-sm-4"
              label={<FormattedMessage id="form.label_address2"/>}
            />
            <div className="clearfix"/>
            <Field
              id="city"
              name="city"
              component={component}
              type="text"
              disabled={!user.isUserOrSuperAdmin}
              labelClassName="font-weight-normal"
              children={<FormattedMessage id="form.label_city"/>}
              divClassName="col-sm-8"
            />
            <Field
              id="zipCode"
              name="zipCode"
              component={component}
              type="text"
              disabled={!user.isUserOrSuperAdmin}
              labelClassName="font-weight-normal"
              children={<FormattedMessage id="form.label_zipCode"/>}
              divClassName="col-sm-8"
            />
            <Field
              id="phone"
              name="phone"
              component={component}
              type="text"
              disabled={!user.isUserOrSuperAdmin}
              labelClassName="font-weight-normal"
              children={<FormattedMessage id="form.label_phone"/>}
              divClassName="col-sm-8"
            />
            <Field
              id="phoneConfirmed"
              name="phoneConfirmed"
              component={component}
              type="checkbox"
              disabled={!user.isUserOrSuperAdmin}
              labelClassName="font-weight-normal"
              children={<FormattedMessage id="form.label_phoneConfirmed"/>}
              divClassName="col-sm-8"
            />
            <div className="clearfix"/>
            <ButtonToolbar className="box-content__toolbar">
              <Button
                disabled={invalid || submitting || !user.isUserOrSuperAdmin}
                type="submit"
                bsStyle="primary"
                id="personal-dataform-save">
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
})(UserAdminPersonalData);

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, {user}: RelayProps,) => ({
  initialValues: {
    email: user.email ? user.email : null,
    firstname: user.firstname ? user.firstname : null,
    lastname: user.lastname ? user.lastname : null,
    gender: user.gender ? user.gender : null,
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth : null,
    address: user.address ? user.address : null,
    address2: user.address2 ? user.address2 : null,
    city: user.city ? user.city.id : null,
    zipCode: user.zipCode ? user.zipCode : null,
    phone: user ? user.phone : null,
    phoneConfirmed: user ? user.phoneConfirmed : null,
  },
});

const container = connect(mapStateToProps)(injectIntl(form));

// same as PersonalData.js I have to find a solution to merge both in one
export default createFragmentContainer(
  container,
  graphql`
  fragment UserAdminPersonalData_user on User {
    id
    email
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
    isUserOrSuperAdmin
  }`,
);
