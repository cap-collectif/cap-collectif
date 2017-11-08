// @flow
import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { isEmail } from '../../../services/Validator';
import type { State } from '../../../types';
import { register as onSubmit } from '../../../redux/modules/user';
import renderComponent from '../../Form/Field';

export const validate = (values: Object, props: Object) => {
  const errors = {};
  if (!values.username || values.username.length < 2) {
    errors.username = 'registration.constraints.username.min';
  }
  if (!values.email || !isEmail(values.email)) {
    errors.email = 'registration.constraints.email.invalid';
  }
  if (!values.plainPassword || values.plainPassword.length < 8) {
    errors.plainPassword = 'registration.constraints.password.min';
  }
  if (values.plainPassword && values.plainPassword.length > 72) {
    errors.plainPassword = 'registration.constraints.password.max';
  }
  if (!values.charte) {
    errors.charte = 'registration.constraints.charte.check';
  }
  if (
    !values.captcha &&
    props.addCaptchaField &&
    (window && window.location.host !== 'capco.test')
  ) {
    errors.captcha = 'registration.constraints.captcha.invalid';
  }
  for (const field of props.dynamicFields) {
    if (field.required && !values[`dynamic-${field.id}`]) {
      errors[`dynamic-${field.id}`] = 'global.required';
    }
  }
  return errors;
};

export const form = 'registration-form';
export const RegistrationForm = React.createClass({
  propTypes: {
    addUserTypeField: PropTypes.bool.isRequired,
    addZipcodeField: PropTypes.bool.isRequired,
    addCaptchaField: PropTypes.bool.isRequired,
    addConsentExternalCommunicationField: PropTypes.bool.isRequired,
    userTypes: PropTypes.array.isRequired,
    cguLink: PropTypes.string.isRequired,
    cguName: PropTypes.string.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    dynamicFields: PropTypes.array.isRequired,
    organizationName: PropTypes.string.isRequired,
  },

  render() {
    const {
      cguLink,
      cguName,
      dynamicFields,
      addZipcodeField,
      addUserTypeField,
      addConsentExternalCommunicationField,
      userTypes,
      handleSubmit,
      addCaptchaField,
      organizationName,
    } = this.props;
    return (
      <form onSubmit={handleSubmit}>
        <Field
          name="username"
          id="username"
          component={renderComponent}
          type="text"
          label={<FormattedMessage id="registration.username" />}
          labelClassName="h5"
        />
        <Field
          name="email"
          id="email"
          component={renderComponent}
          type="email"
          label={<FormattedMessage id="global.email" />}
          labelClassName="h5"
          popover={{
            id: 'registration-email-tooltip',
            message: <FormattedMessage id="registration.tooltip.email" />,
          }}
        />
        <Field
          name="plainPassword"
          id="password"
          component={renderComponent}
          type="password"
          label={<FormattedMessage id="registration.password" />}
          labelClassName="h5"
          popover={{
            id: 'registration-password-tooltip',
            message: <FormattedMessage id="registration.tooltip.password" />,
          }}
        />
        {addUserTypeField && (
          <Field
            id="user_type"
            name="userType"
            component={renderComponent}
            type="select"
            label={
              <span>
                <FormattedMessage id="registration.type" />{' '}
                <span className="excerpt">
                  <FormattedMessage id="global.form.optional" />
                </span>
              </span>
            }
            labelClassName="h5">
            <FormattedMessage id="registration.select.type">
              {message => <option value="">{message}</option>}
            </FormattedMessage>
            {userTypes.map((type, i) => (
              <option key={i + 1} value={type.id}>
                {type.name}
              </option>
            ))}
          </Field>
        )}
        {addZipcodeField && (
          <Field
            id="zipcode"
            name="zipcode"
            component={renderComponent}
            type="text"
            label={
              <span>
                <FormattedMessage id="registration.zipcode" />{' '}
                <span className="excerpt">
                  <FormattedMessage id="global.form.optional" />
                </span>
              </span>
            }
            labelClassName="h5"
            autoComplete="postal-code"
          />
        )}
        {dynamicFields.map((field, key) => {
          let children;
          if (field.choices) {
            const choices = field.choices.map((choice, i) => (
              <option key={i + 1} value={choice.label}>
                {choice.label}
              </option>
            ));
            children = [
              <FormattedMessage id="global.select">
                {message => (
                  <option key={0} value="">
                    {message}
                  </option>
                )}
              </FormattedMessage>,
              ...choices,
            ];
          }
          return (
            <Field
              id={`dynamic-${field.id}`}
              key={key}
              name={`dynamic-${field.id}`}
              component={renderComponent}
              type={field.type}
              label={
                <span>
                  {field.question}{' '}
                  {!field.required && (
                    <span className="excerpt">
                      <FormattedMessage id="global.form.optional" />
                    </span>
                  )}
                </span>
              }
              labelClassName="h5"
              children={children}
            />
          );
        })}
        <Field
          id="charte"
          name="charte"
          component={renderComponent}
          type="checkbox"
          children={
            <FormattedMessage
              id="registration.charte"
              values={{
                link: (
                  <a className="external-link" href={cguLink}>
                    {cguName}
                  </a>
                ),
              }}
            />
          }
        />
        {addConsentExternalCommunicationField && (
          <Field
            id="consent-external-communication"
            name="consentExternalCommunication"
            component={renderComponent}
            type="checkbox"
            children={
              <FormattedMessage
                id="registration.consent_external_communication"
                values={{
                  organization_name: organizationName,
                }}
              />
            }
          />
        )}
        {addCaptchaField && (
          <Field id="captcha" component={renderComponent} name="captcha" type="captcha" />
        )}
      </form>
    );
  },
});

const mapStateToProps = (state: State) => ({
  addCaptchaField: state.default.features.captcha,
  addUserTypeField: state.default.features.user_type,
  addZipcodeField: state.default.features.zipcode_at_register,
  addConsentExternalCommunicationField: state.default.features.consent_external_communication,
  userTypes: state.default.userTypes,
  cguName: state.default.parameters['signin.cgu.name'],
  cguLink: state.default.parameters['signin.cgu.link'],
  dynamicFields: state.user.registration_form.questions,
});

const connector = connect(mapStateToProps);
export default connector(
  reduxForm({
    form,
    validate,
    onSubmit,
  })(RegistrationForm),
);
