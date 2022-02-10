// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import { FormattedHTMLMessage, useIntl } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import type { Dispatch } from 'redux';
import component from '../../Form/Field';
import AlertForm from '../../Alert/AlertForm';
import type { GlobalState } from '~/types';
import UpdateFacebookConfigurationMutation from '../../../mutations/UpdateFacebookSSOConfigurationMutation';
import Heading from '~ui/Primitives/Heading';
import Modal from '~ds/Modal/Modal';
import Text from '~ui/Primitives/Text';
import Button from '~ds/Button/Button';
import type { FacebookConfigurationForm_ssoConfiguration$key } from '~relay/FacebookConfigurationForm_ssoConfiguration.graphql';
import type { FacebookSSOConfiguration } from './ListPublicSSO';

type FormValues = {|
  clientId: string,
  secret: string,
  enabled: boolean,
|};

type Props = {|
  ssoConfiguration: ?FacebookConfigurationForm_ssoConfiguration$key,
  ssoConfigurationConnectionId: string,
  hide: () => void,
  setFacebook: (config: FacebookSSOConfiguration) => void,
  ...FormValues,
  ...ReduxFormFormProps,
|};

const FRAGMENT = graphql`
  fragment FacebookConfigurationForm_ssoConfiguration on FacebookSSOConfiguration {
    __typename
    clientId
    secret
    enabled
  }
`;

const formName = 'facebook-configuration-form';

const onSubmit = (
  { secret, clientId }: FormValues,
  dispatch: Dispatch<*>,
  { hide, ssoConfigurationConnectionId }: Props,
) => {
  return UpdateFacebookConfigurationMutation.commit({
    input: {
      clientId,
      secret,
      enabled: !!secret && !!clientId,
    },
    connections: [ssoConfigurationConnectionId],
  })
    .then(() => {
      hide();
    })
    .catch(() => {
      throw new SubmissionError({
        _error: 'global.error.server.form',
      });
    });
};

const validate = ({ secret, clientId }: FormValues) => {
  const errors = {};

  if (!clientId) {
    errors.clientId = 'global.required';
  } else if (!/^\d+$/.test(clientId)) {
    errors.clientId = 'facebook-app-id-must-be-16-digits';
  }

  if (!secret) {
    errors.secret = 'global.required';
  } else if (secret.length !== 32) {
    errors.secret = 'facebook-app-secret-must-be-32-char';
  }

  return errors;
};

export const FacebookConfigurationForm = ({
  hide,
  ssoConfiguration: ssoConfigurationFragment,
  pristine,
  invalid,
  handleSubmit,
  submitting,
  valid,
  submitSucceeded,
  submitFailed,
}: Props) => {
  const ssoConfiguration = useFragment(FRAGMENT, ssoConfigurationFragment);
  const intl = useIntl();
  return (
    <form id={formName} onSubmit={handleSubmit}>
      <Modal.Header>
        <Modal.Header.Label>
          {intl.formatMessage({ id: 'authentication-method' })}
        </Modal.Header.Label>
        <Heading>{intl.formatMessage({ id: 'edit-facebook-authentication-method' })}</Heading>
      </Modal.Header>
      <Modal.Body>
        <Text>
          <FormattedHTMLMessage id="edit-facebook-authentication-method-create-app" />
        </Text>
        <hr />
        <Field
          id={`${formName}_clientId`}
          name="clientId"
          type="text"
          required
          component={component}
          label={intl.formatMessage({ id: 'App-ID' })}
          placeholder="ex : 1714596595426186"
        />
        <Field
          id={`${formName}_secret`}
          name="secret"
          type="password"
          required
          component={component}
          placeholder="ex : fe7bXXXXXXXXXXXXXXXXXXXXXXXX03xx"
          label={intl.formatMessage({ id: 'App-secret' })}
        />
        <Text>
          <FormattedHTMLMessage id="edit-facebook-authentication-method-find-id-secret" />
        </Text>
      </Modal.Body>
      <Modal.Footer spacing={2}>
        <AlertForm
          valid={valid}
          invalid={invalid && !pristine}
          submitSucceeded={submitSucceeded}
          submitFailed={submitFailed}
          submitting={submitting}
        />
        <Button onClick={hide} variantSize="small" variant="secondary">
          {intl.formatMessage({ id: 'global.cancel' })}
        </Button>
        <Button
          type="submit"
          id={`${formName}_submit`}
          variant="primary"
          variantSize="small"
          disabled={pristine || invalid || submitting}>
          {intl.formatMessage({
            id: submitting
              ? 'global.loading'
              : ssoConfiguration && ssoConfiguration.enabled
              ? 'global.save'
              : 'action_enable',
          })}
        </Button>
      </Modal.Footer>
    </form>
  );
};

const mapStateToProps = (state: GlobalState, { ssoConfiguration }: Props) => {
  return {
    initialValues: {
      ...ssoConfiguration,
    },
  };
};

const form = reduxForm({
  validate,
  onSubmit,
  enableReinitialize: true,
  form: formName,
})(FacebookConfigurationForm);

export default connect<any, any, _, _, _, _>(mapStateToProps)(form);
