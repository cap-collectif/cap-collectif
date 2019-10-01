// @flow
import * as React from 'react';
import { QueryRenderer, graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import { Button } from 'react-bootstrap';
import { isEmail } from '../../../services/Validator';
import type { Dispatch, State } from '../../../types';
import { register as onSubmit, displayChartModal } from '../../../redux/modules/user';
import environment, { graphqlError } from '../../../createRelayEnvironment';
import renderComponent from '../../Form/Field';
import ModalRegistrationFormQuestions from './ModalRegistrationFormQuestions';
import { validateResponses } from '../../../utils/responsesHelper';
import PrivacyModal from '../../StaticPage/PrivacyModal';
import UserPasswordField from '../UserPasswordField';
import { asyncPasswordValidate } from '../UserPasswordComplexityUtils';
import type { RegistrationForm_query } from '~relay/RegistrationForm_query.graphql';

type Props = {|
  ...ReduxFormFormProps,
  intl: IntlShape,
  responses: Array<Object>,
  hasQuestions: boolean,
  addUserTypeField: boolean,
  addZipcodeField: boolean,
  addCaptchaField: boolean,
  privacyPolicyRequired: boolean,
  addConsentExternalCommunicationField: boolean,
  addConsentInternalCommunicationField: boolean,
  userTypes: Array<Object>,
  cguName: string,
  handleSubmit: Function,
  organizationName: string,
  internalCommunicationFrom: string,
  shieldEnabled: boolean,
  dispatch: Dispatch,
  query: RegistrationForm_query,
|};

type FormValues = {
  username: string,
  email: string,
  plainPassword: string,
  charte: string,
  captcha: boolean,
  responses: Array<Object>,
  questions: Array<Object>,
};

const getCustomFieldsErrors = (values: FormValues, props: Props) =>
  values.questions && values.responses
    ? // TODO: remove this parameter from the function or create a specific traduction key
      validateResponses(values.questions, values.responses, 'reply', props.intl).responses
    : [];

export const form = 'registration-form';

export class RegistrationForm extends React.Component<Props> {
  render() {
    const {
      cguName,
      hasQuestions,
      responses,
      change,
      intl,
      addZipcodeField,
      addUserTypeField,
      addConsentExternalCommunicationField,
      addConsentInternalCommunicationField,
      internalCommunicationFrom,
      userTypes,
      handleSubmit,
      addCaptchaField,
      organizationName,
      privacyPolicyRequired,
      dispatch,
    } = this.props;

    const privacyPolicyComponent = privacyPolicyRequired ? (
      <PrivacyModal
        title="capco.module.privacy_policy"
        linkKeyword="and-the"
        className="text-decoration-none"
      />
    ) : null;

    const chartLinkComponent = (
      <FormattedMessage
        id="registration.charte"
        values={{
          link: (
            <Button
              className="p-0 text-decoration-none"
              variant="link"
              bsStyle="link"
              onClick={() => {
                dispatch(displayChartModal());
              }}>
              {cguName}
            </Button>
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
          ariaRequired
          autoComplete="username"
          type="text"
          label={<FormattedMessage id="registration.username" />}
          labelClassName="font-weight-normal"
        />
        <Field
          name="email"
          id="email"
          component={renderComponent}
          type="email"
          autoComplete="email"
          ariaRequired
          label={<FormattedMessage id="global.email" />}
          labelClassName="font-weight-normal"
          popover={{
            id: 'registration-email-tooltip',
            message: <FormattedMessage id="registration.tooltip.email" />,
          }}
        />
        {/* $FlowFixMe */}
        <UserPasswordField
          formName={form}
          id="password"
          name="plainPassword"
          ariaRequired
          autoComplete="new-password"
          label={<FormattedMessage id="registration.password" />}
          labelClassName="font-weight-normal"
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
              {(message: string) => <option value="">{message}</option>}
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
          ariaRequired
          type="checkbox"
          labelClassName="font-weight-normal"
          children={
            <span>
              {chartLinkComponent} {privacyPolicyComponent}
            </span>
          }
        />
        {addConsentInternalCommunicationField && (
          <Field
            id="consent-internal-communication"
            name="consentInternalCommunication"
            component={renderComponent}
            type="checkbox"
            labelClassName="font-weight-normal"
            children={
              <FormattedMessage
                id="receive-news-and-results-of-the-consultations"
                values={{
                  from: internalCommunicationFrom,
                }}
              />
            }
          />
        )}
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

const mapStateToProps = (state: State, props: Props) => ({
  hasQuestions: state.user.registration_form.hasQuestions,
  addCaptchaField: state.default.features.captcha,
  addUserTypeField: state.default.features.user_type,
  addZipcodeField: state.default.features.zipcode_at_register,
  addConsentExternalCommunicationField: state.default.features.consent_external_communication,
  addConsentInternalCommunicationField: state.default.features.consent_internal_communication,
  userTypes: state.default.userTypes,
  cguName: state.default.parameters['signin.cgu.name'],
  organizationName: state.default.parameters['global.site.organization_name'],
  internalCommunicationFrom: state.default.parameters['global.site.communication_from'],
  shieldEnabled: state.default.features.shield_mode,
  privacyPolicyRequired: state.default.features.privacy_policy,
  responses: formValueSelector(form)(state, 'responses'),
  initialValues: {
    responses: [],
    postRegistrationScript: props.query ? props.query.registrationScript : '',
  },
});

export const validate = (values: FormValues, props: Props) => {
  const errors = {};

  if (!values.username || values.username.length < 2) {
    errors.username = 'registration.constraints.username.min';
  }
  if (!values.email || !isEmail(values.email)) {
    errors.email = 'global.constraints.email.invalid';
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

  return { ...errors, responses: getCustomFieldsErrors(values, props) };
};

const asyncValidate = (values: FormValues, dispatch: Dispatch) => {
  return asyncPasswordValidate(form, 'plainPassword', values, dispatch);
};

const formContainer = reduxForm({
  form,
  validate,
  asyncValidate,
  asyncChangeFields: ['plainPassword'],
  onSubmit,
})(RegistrationForm);

export default createFragmentContainer(connect(mapStateToProps)(injectIntl(formContainer)), {
  query: graphql`
    fragment RegistrationForm_query on Query {
      registrationScript
    }
  `,
});
