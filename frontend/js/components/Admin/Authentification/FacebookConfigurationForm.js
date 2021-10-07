// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import type {Dispatch} from "redux";
import component from '../../Form/Field';
import AlertForm from '../../Alert/AlertForm';
import type { GlobalState } from '~/types';
import UpdateFacebookConfigurationMutation from '../../../mutations/UpdateFacebookSSOConfigurationMutation';
import Heading from '~ui/Primitives/Heading';
import Modal from '~ds/Modal/Modal';
import Text from '~ui/Primitives/Text';
import Button from '~ds/Button/Button';
import type {FacebookConfigurationForm_ssoConfiguration} from "~relay/FacebookConfigurationForm_ssoConfiguration.graphql";

type FormValues = {|
  clientId: string,
  secret: string,
  enabled: boolean,
|};

type Props = {|
  ssoConfiguration: FacebookConfigurationForm_ssoConfiguration,
  hide: () => void,
  ...FormValues,
  ...ReduxFormFormProps,
|};

const formName = 'facebook-configuration-form';

const onSubmit = (values: FormValues, dispatch: Dispatch<*>, props: Props) => {
  const { secret, clientId, enabled } = values;
  const { ssoConfiguration, hide } = props;

  return UpdateFacebookConfigurationMutation.commit({
    input: {
      clientId,
      secret,
      enabled: ssoConfiguration ? true : enabled,
    },
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
  } else if (clientId.length !== 16 || !/^\d+$/.test(clientId)) {
    errors.clientId = 'facebook-app-id-must-be-16-digits';
  }

  if (!secret) {
    errors.secret = 'global.required';
  } else if (secret.length !== 32) {
    errors.secret = 'facebook-app-secret-must-be-32-char';
  }

  return errors;
};

export const FacebookConfigurationForm = (props: Props) => {
  const {
    hide,
    ssoConfiguration,
    pristine,
    invalid,
    handleSubmit,
    submitting,
    valid,
    submitSucceeded,
    submitFailed
  } = props;
  return (
    <form id={formName} onSubmit={handleSubmit}>
      <Modal.Header>
        <Modal.Header.Label>
          <FormattedMessage id="authentication-method"/>
        </Modal.Header.Label>
        <Heading>
          <FormattedMessage id="edit-facebook-authentication-method"/>
        </Heading>
      </Modal.Header>
      <Modal.Body>
        <Text>
          <FormattedHTMLMessage id="edit-facebook-authentication-method-create-app"/>
        </Text>
        <hr/>
        <Field
          id={`${formName}_clientId`}
          name="clientId"
          type="text"
          required
          component={component}
          label={<FormattedMessage id="App-ID"/>}
          placeholder="ex : 1714596595426186"
        />
        <Field
          id={`${formName}_secret`}
          name="secret"
          type="password"
          required
          component={component}
          placeholder="ex : fe7bXXXXXXXXXXXXXXXXXXXXXXXX03xx"
          label={<FormattedMessage id="App-secret"/>}
        />
        <Text>
          <FormattedHTMLMessage id="edit-facebook-authentication-method-find-id-secret"/>
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
          <FormattedMessage id="global.cancel"/>
        </Button>
        <Button
          type="submit"
          id={`${formName}_submit`}
          variant="primary"
          variantSize="small"
          disabled={pristine || invalid || submitting}>
          <FormattedMessage
            id={submitting ? 'global.loading' : ((ssoConfiguration && ssoConfiguration.enabled) ? 'global.save' : 'action_enable')}
          />
        </Button>
      </Modal.Footer>
    </form>
  )
};

const mapStateToProps = (state: GlobalState, props: Props) => {
  return {
    initialValues: {
      ...props.ssoConfiguration,
    },
  };
};

const form = reduxForm({
  validate,
  onSubmit,
  enableReinitialize: true,
  form: formName,
})(FacebookConfigurationForm);

const container = connect<any, any, _, _, _, _>(mapStateToProps)(form);
export default createFragmentContainer(container, {
  ssoConfiguration: graphql`
    fragment FacebookConfigurationForm_ssoConfiguration on FacebookSSOConfiguration {
      __typename
      clientId
      secret
      enabled
    }
  `,
});
