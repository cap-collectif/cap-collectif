// @flow
import React from 'react';
import { connect } from 'react-redux';
import type { FormProps } from 'redux-form';
import { Button, Modal, ToggleButton } from 'react-bootstrap';
import { change, Field, reduxForm } from 'redux-form';
import { FormattedMessage, type IntlShape } from 'react-intl';

import component from '../../Form/Field';
import AlertForm from '../../Alert/AlertForm';
import CloseButton from '../../Form/CloseButton';
import type { GlobalState, Uri } from '../../../types';

type FormValues = {|
  environment: ?'test' | ?'prod',
  clientId: ?string,
  secret: ?string,
  redirectUri: Uri,
|};

type Props = {|
  show: boolean,
  onClose: () => void,
  ...FormValues,
  ...FormProps,
  intl: IntlShape,
|};

const formName = 'france-connect-configuration-form';

const onSubmit = (/* values: FormValues, dispatch: Dispatch, props: Props */) => {
  // TODO
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

export class FranceConnectConfigurationModal extends React.Component<Props> {
  static defaultProps = {
    secret: null,
    clientId: null,
    environment: null,
  };

  render() {
    const {
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
    } = this.props;
    return (
      <Modal show={show} onHide={onClose} aria-labelledby="france-connect-modal-lg">
        <form onSubmit={handleSubmit} id={`${formName}`}>
          <Modal.Header closeButton>
            <Modal.Title
              id="oauth2-sso-modal-lg"
              children={<FormattedMessage id="edit-france-connect-authentication-method" />}
            />
          </Modal.Header>
          <Modal.Body>
            <h4>Configuration</h4>
            <FormattedMessage id="environment" tagName="p" />
            <Field
              id={`${formName}_environment`}
              name="environment"
              type="radio-buttons"
              required
              component={component}>
              <ToggleButton
                value="test"
                onClick={() => dispatch(change(formName, 'environment', 'test'))}>
                <FormattedMessage id="integration" />
              </ToggleButton>
              <ToggleButton
                value="prod"
                onClick={() => dispatch(change(formName, 'environment', 'prod'))}>
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
              type="text"
              component={component}
              label={<FormattedMessage id="callback-url" />}
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
  }
}

const mapStateToProps = (state: GlobalState, props: Props) => ({
  initialValues: {
    ...props,
  },
});

const form = reduxForm({
  validate,
  onSubmit,
  enableReinitialize: true,
  form: formName,
})(FranceConnectConfigurationModal);

export default connect(mapStateToProps)(form);
