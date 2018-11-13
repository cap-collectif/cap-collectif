// @flow
import * as React from 'react';
import {createFragmentContainer, graphql} from 'react-relay';
import {FormattedMessage, injectIntl, IntlShape} from 'react-intl';
import {connect, type MapStateToProps} from 'react-redux';
import {Field, FieldArray, reduxForm, type FormProps} from 'redux-form';
import {isEmail} from '../../../services/Validator';
import type {Dispatch, State} from '../../../types';
import type {RegistrationForm_registrationForm} from './__generated__/RegistrationForm_registrationForm.graphql'
import {register as onSubmit, displayChartModal} from '../../../redux/modules/user';
import renderComponent from '../../Form/Field';
import {formatInitialResponsesValues, renderResponses} from "../../../utils/responsesHelper";
import type {ResponsesInReduxForm} from "../../../utils/responsesHelper";

type Props = FormProps & {
  registrationForm: RegistrationForm_registrationForm,
  intl: IntlShape,
  responses: ResponsesInReduxForm,
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
      registrationForm,
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
          label={<FormattedMessage id="registration.username"/>}
          labelClassName="font-weight-normal"
        />
        <Field
          name="email"
          id="email"
          component={renderComponent}
          type="email"
          label={<FormattedMessage id="global.email"/>}
          labelClassName="font-weight-normal"
          popover={{
            id: 'registration-email-tooltip',
            message: <FormattedMessage id="registration.tooltip.email"/>,
          }}
        />
        <Field
          name="plainPassword"
          id="password"
          component={renderComponent}
          type="password"
          label={<FormattedMessage id="registration.password"/>}
          labelClassName="font-weight-normal"
          popover={{
            id: 'registration-password-tooltip',
            message: <FormattedMessage id="registration.tooltip.password"/>,
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
                <FormattedMessage id="registration.type"/>{' '}
                <span className="excerpt">
                  <FormattedMessage id="global.form.optional"/>
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
                <FormattedMessage id="registration.zipcode"/>{' '}
                <span className="excerpt">
                  <FormattedMessage id="global.form.optional"/>
                </span>
              </span>
            }
            autoComplete="postal-code"
          />
        )}
        <FieldArray
          name="responses"
          change={change}
          responses={responses}
          form={form}
          component={renderResponses}
          questions={registrationForm.questions}
          intl={intl}
        />
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
          <Field id="captcha" component={renderComponent} name="captcha" type="captcha"/>
        )}
      </form>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, props: Props) => ({
  addCaptchaField: state.default.features.captcha,
  addUserTypeField: state.default.features.user_type,
  addZipcodeField: state.default.features.zipcode_at_register,
  addConsentExternalCommunicationField: state.default.features.consent_external_communication,
  userTypes: state.default.userTypes,
  cguName: state.default.parameters['signin.cgu.name'],
  cguLink: state.default.parameters['signin.cgu.link'],
  organizationName: state.default.parameters['global.site.organization_name'],
  responses: formatInitialResponsesValues(
    props.registrationForm.questions,
    []
  ),
  initialValues: {
    registrationForm: props.registrationForm,
    responses: formatInitialResponsesValues(
      props.registrationForm.questions,
      []
    )
  },
  shieldEnabled: state.default.features.shield_mode,
});

const formContainer = reduxForm({
  form,
  validate,
  onSubmit,
})(RegistrationForm)


const container = connect(mapStateToProps)(injectIntl(formContainer));

export default createFragmentContainer(container,
  graphql`
    fragment RegistrationForm_registrationForm on RegistrationForm {
      id
      questions {
        id
        number
        title
        position
        private
        required
        description
        helpText
        jumps {
          id
          always
          destination {
            id
            title
            number
          }
          conditions {
            id
            operator
            question {
              id
              title
            }
            ... on MultipleChoiceQuestionLogicJumpCondition {
              value {
                id
                title
              }
            }
          }
        }
        type
        ... on MultipleChoiceQuestion {
          isOtherAllowed
          validationRule {
            type
            number
          }
          choices(randomize: true) {
            id
            title
            description
            color
            image {
              url
            }
          }
        }
      }
    }
  `)
