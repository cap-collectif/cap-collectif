// @flow
import * as React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import { Field, reduxForm, type FormProps, formValueSelector } from 'redux-form';
import { isEmail } from '../../../services/Validator';
import type { Dispatch, State } from '../../../types';
import { register as onSubmit, displayChartModal } from '../../../redux/modules/user';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import renderComponent from '../../Form/Field';
import ModalRegistrationFormQuestions from './ModalRegistrationFormQuestions';

type Props = FormProps & {
  intl: IntlShape,
  responses: Array<Object>,
  hasQuestions: boolean,
  addUserTypeField: boolean,
  addZipcodeField: boolean,
  addCaptchaField: boolean,
  addConsentExternalCommunicationField: boolean,
  userTypes: Array<Object>,
  cguLink: string,
  cguName: string,
  handleSubmit: Function,
  organizationName: string,
  shieldEnabled: boolean,
  dispatch: Dispatch,
};

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
  return errors;
};

export const form = 'registration-form';

export class RegistrationForm extends React.Component<Props> {
  render() {
    const {
      cguLink,
      cguName,
      hasQuestions,
      responses,
      change,
      intl,
      addZipcodeField,
      addUserTypeField,
      addConsentExternalCommunicationField,
      userTypes,
      handleSubmit,
      addCaptchaField,
      organizationName,
      shieldEnabled,
      dispatch,
    } = this.props;

    const chartLinkComponent = shieldEnabled ? (
      <FormattedMessage
        id="registration.charte"
        values={{
          link: (
            <button
              onClick={() => {
                dispatch(displayChartModal());
              }}>
              {cguName}
            </button>
          ),
        }}
      />
    ) : (
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
    );

    return (
      <form onSubmit={handleSubmit} id="registration-form">
        <Field
          name="username"
          id="username"
          component={renderComponent}
          type="text"
          label={<FormattedMessage id="registration.username" />}
          labelClassName="font-weight-normal"
        />
        <Field
          name="email"
          id="email"
          component={renderComponent}
          type="email"
          label={<FormattedMessage id="global.email" />}
          labelClassName="font-weight-normal"
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
          labelClassName="font-weight-normal"
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
            labelClassName="font-weight-normal"
            label={
              <span>
                <FormattedMessage id="registration.type" />{' '}
                <span className="excerpt">
                  <FormattedMessage id="global.form.optional" />
                </span>
              </span>
            }>
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
            labelClassName="font-weight-normal"
            label={
              <span>
                <FormattedMessage id="registration.zipcode" />{' '}
                <span className="excerpt">
                  <FormattedMessage id="global.form.optional" />
                </span>
              </span>
            }
            autoComplete="postal-code"
          />
        )}
        {hasQuestions && (
          <QueryRenderer
            environment={environment}
            query={graphql`
              query RegistrationFormQuery {
                registrationForm {
                  id
                  questions {
                    id
                    ...responsesHelper_question @relay(mask: false)
                  }
                }
              }
            `}
            variables={{}}
            render={({ error, props }) => {
              if (error) {
                console.log(error); // eslint-disable-line no-console
                return graphqlError;
              }
              if (props && props.registrationForm && props.registrationForm.questions) {
                return (
                  <ModalRegistrationFormQuestions
                    change={change}
                    responses={responses}
                    form={form}
                    questions={props.registrationForm.questions}
                    intl={intl}
                  />
                );
              }

              return null;
            }}
          />
        )}
        <Field
          id="charte"
          name="charte"
          component={renderComponent}
          type="checkbox"
          labelClassName="font-weight-normal"
          children={chartLinkComponent}
        />
        {addConsentExternalCommunicationField && (
          <Field
            id="consent-external-communication"
            name="consentExternalCommunication"
            component={renderComponent}
            type="checkbox"
            labelClassName="font-weight-normal"
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
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  hasQuestions: state.user.registration_form.hasQuestions,
  addCaptchaField: state.default.features.captcha,
  addUserTypeField: state.default.features.user_type,
  addZipcodeField: state.default.features.zipcode_at_register,
  addConsentExternalCommunicationField: state.default.features.consent_external_communication,
  userTypes: state.default.userTypes,
  cguName: state.default.parameters['signin.cgu.name'],
  cguLink: state.default.parameters['signin.cgu.link'],
  organizationName: state.default.parameters['global.site.organization_name'],
  shieldEnabled: state.default.features.shield_mode,
  responses: formValueSelector(form)(state, 'responses'),
  initialValues: {
    responses: [],
  },
});

const formContainer = reduxForm({
  form,
  validate,
  onSubmit,
})(RegistrationForm);

export default connect(mapStateToProps)(injectIntl(formContainer));
