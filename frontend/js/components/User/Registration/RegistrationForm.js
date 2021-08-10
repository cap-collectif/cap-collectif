// @flow
import * as React from 'react';
import memoize from 'lodash/memoize';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { connect } from 'react-redux';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import { Button } from 'react-bootstrap';
import { isEmail } from '~/services/Validator';
import type { Dispatch, State } from '~/types';
import { register as onSubmit, displayChartModal } from '~/redux/modules/user';
import renderComponent from '../../Form/Field';
import ModalRegistrationFormQuestions from './ModalRegistrationFormQuestions';
import PrivacyModal from '../../StaticPage/PrivacyModal';
import UserPasswordField from '../UserPasswordField';
import { asyncPasswordValidate } from '../UserPasswordComplexityUtils';
import type { RegistrationForm_query } from '~relay/RegistrationForm_query.graphql';
import validateResponses from '~/utils/form/validateResponses';
import formatInitialResponsesValues from '~/utils/form/formatInitialResponsesValues';
import type { Questions, ResponsesInReduxForm } from '~/components/Form/Form.type';
import { REGEX_USERNAME } from '~/constants/FormConstants';
import AppBox from '~/components/Ui/Primitives/AppBox';

type Props = {|
  ...ReduxFormFormProps,
  intl: IntlShape,
  responses: Array<Object>,
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
  email?: string,
  invitationToken?: string,
  questions: Questions,
  locale: string,
|};

type FormValues = {
  locale: string,
  username: string,
  email: string,
  plainPassword: string,
  charte: string,
  captcha: boolean,
  responses: ResponsesInReduxForm,
  questions: Questions,
};

const memoizeAvailableQuestions: any = memoize(() => {});

const getCustomFieldsErrors = (values: FormValues, props: Props) => {
  // TODO: remove this parameter from the function or create a specific traduction key
  if (values.questions && values.responses) {
    const availableQuestions: Array<string> = memoizeAvailableQuestions.cache.get(
      'availableQuestions',
    );

    return validateResponses(
      values.questions,
      values.responses,
      'reply',
      props.intl,
      false,
      availableQuestions,
    ).responses;
  }

  return [];
};

export const form = 'registration-form';

export const ChartLinkComponent = ({
  cguName,
  dispatch,
}: {|
  +cguName: string,
  +dispatch: Dispatch,
|}) => {
  return (
    <AppBox as="span" css={{ '& > span': { display: 'inline-flex', alignItems: 'center' } }}>
      <FormattedMessage
        id="registration.charte"
        css={{ display: 'inline-flex' }}
        values={{
          link: (
            <Button
              className="p-0 ml-5 mr-5 text-decoration-none"
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
    </AppBox>
  );
};

export const PrivacyPolicyComponent = ({
  privacyPolicyRequired,
  onClick,
}: {|
  +onClick?: () => void,
  +privacyPolicyRequired: boolean,
|}) =>
  privacyPolicyRequired ? (
    <PrivacyModal
      onClick={onClick}
      title="capco.module.privacy_policy"
      linkKeyword="and-the"
      className="text-decoration-none"
    />
  ) : null;

export const RegistrationForm = ({
  cguName,
  responses,
  change,
  query,
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
  email,
  questions,
  locale,
}: Props) => {
  return (
    <form onSubmit={handleSubmit} id="registration-form">
      <Field name="locale" id="locale" component={renderComponent} value={locale} type="hidden" />
      <Field
        name="email"
        disabled={!!email}
        id="email"
        component={renderComponent}
        type="email"
        autoComplete="email"
        ariaRequired
        label={<FormattedMessage id="global.email" />}
        labelClassName="font-weight-normal"
        placeholder="global.placeholder.email"
        popover={{
          id: 'registration-email-tooltip',
          message: <FormattedMessage id="registration.tooltip.email" />,
        }}
      />
      <UserPasswordField
        formName={form}
        id="password"
        name="plainPassword"
        ariaRequired
        autoComplete="off"
        label={<FormattedMessage id="registration.password" />}
        labelClassName="font-weight-normal"
      />
      <Field
        name="username"
        id="username"
        component={renderComponent}
        ariaRequired
        autoComplete="username"
        type="text"
        label={<FormattedMessage id="global.fullname" />}
        placeholder="global.placeholder.name"
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
                <FormattedMessage id="global.optional" />
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
              <FormattedMessage id="user.register.zipcode" />{' '}
              <span className="excerpt">
                <FormattedMessage id="global.optional" />
              </span>
            </span>
          }
          autoComplete="postal-code"
        />
      )}
      {questions && questions.length > 0 && query?.registrationForm && (
        <ModalRegistrationFormQuestions
          change={change}
          registrationForm={query.registrationForm}
          responses={responses}
          form={form}
          memoizeAvailableQuestions={memoizeAvailableQuestions}
        />
      )}
      <Field
        id="charte"
        name="charte"
        component={renderComponent}
        ariaRequired
        type="checkbox"
        labelClassName="font-weight-normal">
        <span>
          <ChartLinkComponent cguName={cguName} dispatch={dispatch} />
          <PrivacyPolicyComponent privacyPolicyRequired={privacyPolicyRequired} />
        </span>
      </Field>
      {addConsentInternalCommunicationField && (
        <Field
          id="consent-internal-communication"
          name="consentInternalCommunication"
          component={renderComponent}
          type="checkbox"
          labelClassName="font-weight-normal">
          <FormattedMessage
            id="receive-news-and-results-of-the-consultations"
            values={{
              from: internalCommunicationFrom,
            }}
          />
        </Field>
      )}
      {addConsentExternalCommunicationField && (
        <Field
          id="consent-external-communication"
          name="consentExternalCommunication"
          component={renderComponent}
          type="checkbox"
          labelClassName="font-weight-normal">
          <FormattedMessage
            id="registration.consent_external_communication"
            values={{
              organization_name: organizationName,
            }}
          />
        </Field>
      )}
      {addCaptchaField && (
        <Field id="captcha" component={renderComponent} name="captcha" type="captcha" />
      )}
    </form>
  );
};

const mapStateToProps = (state: State, props: Props) => {
  const questions = props.query?.registrationForm?.questions || [];

  return {
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
    questions: props.query ? questions : [],
    responses: formValueSelector(form)(state, 'responses'),
    initialValues: {
      locale: props.locale,
      questions: props.query ? questions : [],
      responses: props.query ? formatInitialResponsesValues(questions, []) : [],
      email: props.email,
      invitationToken: props.invitationToken,
    },
  };
};

export const validate = (values: FormValues, props: Props) => {
  const errors = {};

  if (!values.username || values.username.length < 2) {
    errors.username = 'registration.constraints.username.min';
  }
  if (values.username && !REGEX_USERNAME.test(values.username)) {
    errors.username = 'registration.constraints.username.symbol';
  }
  if (!values.email || !isEmail(values.email)) {
    errors.email = 'global.constraints.email.invalid';
  }
  if (!values.plainPassword || values.plainPassword.length < 1) {
    errors.plainPassword = 'at-least-8-characters-one-digit-one-uppercase-one-lowercase';
  }
  if (!values.charte) {
    errors.charte = 'registration.constraints.charte.check';
  }
  if (!values.captcha && props.addCaptchaField && window && window.location.host !== 'capco.test') {
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

const RegistrationFormConnected = connect<any, any, _, _, _, _>(mapStateToProps)(
  injectIntl(formContainer),
);

export default createFragmentContainer(RegistrationFormConnected, {
  query: graphql`
    fragment RegistrationForm_query on Query {
      registrationScript
      registrationForm {
        questions {
          id
          type
          ...responsesHelper_question @relay(mask: false)
        }
        ...ModalRegistrationFormQuestions_registrationForm
      }
    }
  `,
});
