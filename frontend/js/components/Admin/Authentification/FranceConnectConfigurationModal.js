// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Button, Modal, ToggleButton } from 'react-bootstrap';
import { change, Field, reduxForm, SubmissionError } from 'redux-form';
import { FormattedMessage, type IntlShape } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import Toggle from '../../Form/Toggle';
import component from '../../Form/Field';
import AlertForm from '../../Alert/AlertForm';
import CloseButton from '../../Form/CloseButton';
import type { GlobalState, Uri, Dispatch } from '../../../types';
import type {
  FranceConnectConfigurationModal_ssoConfiguration,
  SSOEnvironment,
} from '~relay/FranceConnectConfigurationModal_ssoConfiguration.graphql';
import UpdateFranceConnectConfigurationMutation from '../../../mutations/UpdateFranceConnectSSOConfigurationMutation';

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

type Props = {|
  ssoConfiguration: FranceConnectConfigurationModal_ssoConfiguration,
  show: boolean,
  onClose: () => void,
  ...FormValues,
  ...ReduxFormFormProps,
  intl: IntlShape,
|};

const formName = 'france-connect-configuration-form';

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const {
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
  } = values;

  const { onClose } = props;

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
}: Props) => (
  <Modal show={show} onHide={onClose} aria-labelledby="france-connect-modal-lg">
    <form onSubmit={handleSubmit} id={`${formName}`}>
      <Modal.Header closeButton>
        <Modal.Title id="oauth2-sso-modal-lg">
          <FormattedMessage id="edit-france-connect-authentication-method" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4>
          <FormattedMessage id="Configuration" />
        </h4>
        <FormattedMessage id="environment" tagName="p" />
        <Field
          id={`${formName}_environment`}
          name="environment"
          type="radio-buttons"
          required
          component={component}>
          <ToggleButton
            value="TESTING"
            onClick={() => dispatch(change(formName, 'environment', 'TESTING'))}>
            <FormattedMessage id="integration" />
          </ToggleButton>
          <ToggleButton
            value="PRODUCTION"
            onClick={() => dispatch(change(formName, 'environment', 'PRODUCTION'))}>
            <FormattedMessage id="production" />
          </ToggleButton>
        </Field>
        <Field
          id={`${formName}_clientId`}
          name="clientId"
          type="text"
          required
          component={component}
          label={<FormattedMessage id="client-id" />}
        />
        <Field
          id={`${formName}_secret`}
          name="secret"
          type="text"
          required
          component={component}
          label={<FormattedMessage id="secret" />}
        />
        <Field
          id={`${formName}_redirectUri`}
          name="redirectUri"
          disabled
          required
          type="text"
          component={component}
          label={<FormattedMessage id="callback-url" />}
        />
        <Field
          id={`${formName}_logoutUrl`}
          name="logoutUrl"
          disabled
          required
          type="text"
          component={component}
          label={<FormattedMessage id="logout-url" />}
        />
        <label>
          <FormattedMessage id="fc-allowed-fields" />
        </label>
        <Field
          id={`${formName}_given_name`}
          name="given_name"
          component={Toggle}
          label={<FormattedMessage id="form.label_firstname" />}
        />
        <Field
          id={`${formName}_family_name`}
          name="family_name"
          component={Toggle}
          label={<FormattedMessage id="form.label_lastname" />}
        />
        <Field
          id={`${formName}_birthdate`}
          name="birthdate"
          component={Toggle}
          label={<FormattedMessage id="form.label_date_of_birth" />}
        />
        <Field
          id={`${formName}_birthplace`}
          name="birthplace"
          component={Toggle}
          label={<FormattedMessage id="birthPlace" />}
        />
        <Field
          id={`${formName}_birthcountry`}
          name="birthcountry"
          component={Toggle}
          label={<FormattedMessage id="birth-country" />}
        />
        <Field
          id={`${formName}_gender`}
          name="gender"
          component={Toggle}
          label={<FormattedMessage id="form.label_gender" />}
        />
        <Field
          id={`${formName}_email`}
          name="email"
          component={Toggle}
          label={<FormattedMessage id="filter.label_email" />}
        />
        <Field
          id={`${formName}_preferred_username`}
          name="preferred_username"
          component={Toggle}
          label={<FormattedMessage id="list.label_username" />}
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
          <FormattedMessage id={submitting ? 'global.loading' : 'global.save'} />
        </Button>
      </Modal.Footer>
    </form>
  </Modal>
);

const mapStateToProps = (state: GlobalState, props: Props) => {
  const data = props.ssoConfiguration.allowedData;
  return {
    initialValues: {
      ...props.ssoConfiguration,
      given_name: data.includes('given_name'),
      family_name: data.includes('family_name'),
      birthdate: data.includes('birthdate'),
      birthplace: data.includes('birthplace'),
      birthcountry: data.includes('birthcountry'),
      gender: data.includes('gender'),
      email: data.includes('email'),
      preferred_username: data.includes('preferred_username'),
    },
  };
};

const form = reduxForm({
  validate,
  onSubmit,
  enableReinitialize: true,
  form: formName,
})(FranceConnectConfigurationModal);

const container = connect<any, any, _, _, _, _>(mapStateToProps)(form);
export default createFragmentContainer(container, {
  ssoConfiguration: graphql`
    fragment FranceConnectConfigurationModal_ssoConfiguration on FranceConnectSSOConfiguration {
      id
      clientId
      secret
      environment
      redirectUri
      logoutUrl
      allowedData
    }
  `,
});
