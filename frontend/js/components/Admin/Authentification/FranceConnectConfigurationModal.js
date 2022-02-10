// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { Button, Modal, ToggleButton } from 'react-bootstrap';
import { change, Field, reduxForm, SubmissionError } from 'redux-form';
import { useIntl } from 'react-intl';
import Toggle from '../../Form/Toggle';
import component from '../../Form/Field';
import AlertForm from '../../Alert/AlertForm';
import CloseButton from '../../Form/CloseButton';
import type { Uri, Dispatch } from '~/types';
import type {
  FranceConnectConfigurationModal_ssoConfiguration$key,
  SSOEnvironment,
} from '~relay/FranceConnectConfigurationModal_ssoConfiguration.graphql';
import UpdateFranceConnectConfigurationMutation from '../../../mutations/UpdateFranceConnectSSOConfigurationMutation';
import Text from '~ui/Primitives/Text';

type FormValues = {|
  environment: SSOEnvironment,
  clientId: string,
  secret: string,
  redirectUri: Uri,
  logoutUrl: Uri,
  given_name: boolean,
  family_name: boolean,
  birthdate: boolean,
  birthplace: boolean,
  birthcountry: boolean,
  gender: boolean,
  email: boolean,
  preferred_username: boolean,
|};

type FranceConnectProps = {|
  +franceConnectConfiguration: FranceConnectConfigurationModal_ssoConfiguration$key,
  show: boolean,
  onClose: () => void,
|};

type Props = {|
  ...FormValues,
  ...ReduxFormFormProps,
  ...FranceConnectProps,
|};

const formName = 'france-connect-configuration-form';

const FRAGMENT = graphql`
  fragment FranceConnectConfigurationModal_ssoConfiguration on FranceConnectSSOConfiguration {
    id
    clientId
    secret
    environment
    redirectUri
    logoutUrl
    allowedData
  }
`;

const onSubmit = (
  {
    environment,
    secret,
    clientId,
    given_name,
    family_name,
    birthdate,
    gender,
    birthplace,
    birthcountry,
    email,
    preferred_username,
  }: FormValues,
  dispatch: Dispatch,
  { onClose }: Props,
) => {
  return UpdateFranceConnectConfigurationMutation.commit({
    input: {
      environment,
      clientId,
      secret,
      given_name,
      family_name,
      birthdate,
      gender,
      birthplace,
      birthcountry,
      email,
      preferred_username,
    },
  })
    .then(() => {
      if (onClose) {
        onClose();
      }
    })
    .catch(() => {
      throw new SubmissionError({
        _error: 'global.error.server.form',
      });
    });
};

const validate = ({ secret, clientId, environment }: FormValues) => {
  const errors = {};

  if (!environment) {
    errors.environment = 'global.required';
  }

  if (!secret) {
    errors.secret = 'global.required';
  } else if (secret.length < 2) {
    errors.secret = 'two-characters-minimum-required';
  }

  if (!clientId) {
    errors.clientId = 'global.required';
  } else if (clientId.length < 2) {
    errors.clientId = 'two-characters-minimum-required';
  }

  return errors;
};

export const FranceConnectConfigurationModal = ({
  show,
  onClose,
  pristine,
  invalid,
  handleSubmit,
  submitting,
  valid,
  submitSucceeded,
  submitFailed,
  dispatch,
}: Props) => {
  const intl = useIntl();
  return (
    <Modal show={show} onHide={onClose} aria-labelledby="france-connect-modal-lg">
      <form onSubmit={handleSubmit} id={`${formName}`}>
        <Modal.Header closeButton>
          <Modal.Title id="oauth2-sso-modal-lg">
            {intl.formatMessage({ id: 'edit-france-connect-authentication-method' })}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>{intl.formatMessage({ id: 'Configuration' })}</h4>
          <Text>{intl.formatMessage({ id: 'environment' })}</Text>
          <Field
            id={`${formName}_environment`}
            name="environment"
            type="radio-buttons"
            required
            component={component}>
            <ToggleButton
              value="TESTING"
              onClick={() => dispatch(change(formName, 'environment', 'TESTING'))}>
              {intl.formatMessage({ id: 'integration' })}
            </ToggleButton>
            <ToggleButton
              value="PRODUCTION"
              onClick={() => dispatch(change(formName, 'environment', 'PRODUCTION'))}>
              {intl.formatMessage({ id: 'production' })}
            </ToggleButton>
          </Field>
          <Field
            id={`${formName}_clientId`}
            name="clientId"
            type="text"
            required
            component={component}
            label={intl.formatMessage({ id: 'client-id' })}
          />
          <Field
            id={`${formName}_secret`}
            name="secret"
            type="text"
            required
            component={component}
            label={intl.formatMessage({ id: 'secret' })}
          />
          <Field
            id={`${formName}_redirectUri`}
            name="redirectUri"
            disabled
            required
            type="text"
            component={component}
            label={intl.formatMessage({ id: 'callback-url' })}
          />
          <Field
            id={`${formName}_logoutUrl`}
            name="logoutUrl"
            disabled
            required
            type="text"
            component={component}
            label={intl.formatMessage({ id: 'logout-url' })}
          />
          <label>{intl.formatMessage({ id: 'fc-allowed-fields' })}</label>
          <Field
            id={`${formName}_given_name`}
            name="given_name"
            component={Toggle}
            label={intl.formatMessage({ id: 'form.label_firstname' })}
          />
          <Field
            id={`${formName}_family_name`}
            name="family_name"
            component={Toggle}
            label={intl.formatMessage({ id: 'form.label_lastname' })}
          />
          <Field
            id={`${formName}_birthdate`}
            name="birthdate"
            component={Toggle}
            label={intl.formatMessage({ id: 'form.label_date_of_birth' })}
          />
          <Field
            id={`${formName}_birthplace`}
            name="birthplace"
            component={Toggle}
            label={intl.formatMessage({ id: 'birthPlace' })}
          />
          <Field
            id={`${formName}_birthcountry`}
            name="birthcountry"
            component={Toggle}
            label={intl.formatMessage({ id: 'birth-country' })}
          />
          <Field
            id={`${formName}_gender`}
            name="gender"
            component={Toggle}
            label={intl.formatMessage({ id: 'form.label_gender' })}
          />
          <Field
            id={`${formName}_email`}
            name="email"
            component={Toggle}
            label={intl.formatMessage({ id: 'filter.label_email' })}
          />
          <Field
            id={`${formName}_preferred_username`}
            name="preferred_username"
            component={Toggle}
            label={intl.formatMessage({ id: 'list.label_username' })}
          />
        </Modal.Body>
        <Modal.Footer>
          <AlertForm
            valid={valid}
            invalid={invalid && !pristine}
            submitSucceeded={submitSucceeded}
            submitFailed={submitFailed}
            submitting={submitting}
          />
          <CloseButton onClose={onClose} />
          <Button
            type="submit"
            id={`${formName}_submit`}
            bsStyle="primary"
            disabled={pristine || invalid || submitting}>
            {intl.formatMessage({ id: submitting ? 'global.loading' : 'global.save' })}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

const form = reduxForm({
  validate,
  onSubmit,
  enableReinitialize: true,
  form: formName,
})(FranceConnectConfigurationModal);

function injectProps(Component) {
  return function WrapperComponent(props: FranceConnectProps) {
    const { franceConnectConfiguration: franceConnectConfigurationFragment } = props;
    const franceConnectConfiguration = useFragment(FRAGMENT, franceConnectConfigurationFragment);
    const data = franceConnectConfiguration?.allowedData ?? [];
    const initialValues = {
      ...franceConnectConfiguration,
      given_name: data.includes('given_name'),
      family_name: data.includes('family_name'),
      birthdate: data.includes('birthdate'),
      birthplace: data.includes('birthplace'),
      birthcountry: data.includes('birthcountry'),
      gender: data.includes('gender'),
      email: data.includes('email'),
      preferred_username: data.includes('preferred_username'),
    };

    return (
      <Component
        {...props}
        initialValues={initialValues}
        franceConnectConfiguration={franceConnectConfiguration}
      />
    );
  };
}

const container = (injectProps(form): React.AbstractComponent<FranceConnectProps>);

export default container;
