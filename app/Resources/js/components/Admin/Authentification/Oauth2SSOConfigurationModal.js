// @flow
import React from 'react';
import { connect } from 'react-redux';
import type { FormProps } from 'redux-form';
import { Button, Modal } from 'react-bootstrap';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import { injectIntl, FormattedMessage, type IntlShape } from 'react-intl';

import component from '../../Form/Field';
import AlertForm from '../../Alert/AlertForm';
import CloseButton from '../../Form/CloseButton';
import { isUrl } from '../../../services/Validator';
import type { GlobalState, Uri, Uuid } from '../../../types';
import AddOauth2SSOConfigurationMutation from '../../../mutations/AddOauth2SSOConfigurationMutation';
import UpdateOauth2SSOConfigurationMutation from '../../../mutations/UpdateOauth2SSOConfigurationMutation';
import ColorPickerInput from '../../Form/ColorPickerInput';

type FormValues = {|
  id?: ?Uuid,
  name: ?string,
  clientId: ?string,
  secret: ?string,
  authorizationUrl: ?Uri,
  accessTokenUrl: ?Uri,
  userInfoUrl: ?Uri,
  logoutUrl: ?Uri,
  redirectUri: Uri,
  profileUrl: ?Uri,
  buttonColor: string,
  labelColor: string,
|};

type Props = {|
  show: boolean,
  onClose: () => void,
  isCreating: boolean,
  ...FormValues,
  ...FormProps,
  intl: IntlShape,
|};

const formName = 'oauth2-sso-configuration-form';

const onSubmit = (values: FormValues, dispatch: Dispatch, props: Props) => {
  const {
    id,
    name,
    clientId,
    secret,
    authorizationUrl,
    accessTokenUrl,
    userInfoUrl,
    logoutUrl,
    profileUrl,
    buttonColor,
    labelColor,
  } = values;

  const { onClose } = props;

  const input = {
    name,
    secret,
    enabled: true,
    clientId,
    logoutUrl,
    profileUrl,
    userInfoUrl,
    accessTokenUrl,
    authorizationUrl,
    buttonColor,
    labelColor,
  };

  if (id === undefined || id === null) {
    return AddOauth2SSOConfigurationMutation.commit({ input })
      .then(() => {
        if (onClose) {
          onClose();
        }
        window.location.reload();
      })
      .catch(() => {
        throw new SubmissionError({
          _error: 'global.error.server.form',
        });
      });
  }

  return UpdateOauth2SSOConfigurationMutation.commit({
    input: {
      id,
      ...input,
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

const validateUrl = (url: ?string): ?string => {
  if (!url) {
    return 'global.required';
  }
  if (!isUrl(url)) {
    return 'source.constraints.link';
  }
  return null;
};

const validate = ({
  name,
  secret,
  clientId,
  logoutUrl,
  profileUrl,
  userInfoUrl,
  authorizationUrl,
  accessTokenUrl,
  buttonColor,
  labelColor,
}: FormValues) => {
  const errors = {};

  if (!name) {
    errors.name = 'global.required';
  } else if (name.length < 2) {
    errors.name = 'two-characters-minimum-required';
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

  if (!buttonColor) {
    errors.buttonColor = 'global.required';
  }

  if (!labelColor) {
    errors.labelColor = 'global.required';
  }

  errors.logoutUrl = validateUrl(logoutUrl);
  errors.profileUrl = validateUrl(profileUrl);
  errors.userInfoUrl = validateUrl(userInfoUrl);
  errors.accessTokenUrl = validateUrl(accessTokenUrl);
  errors.authorizationUrl = validateUrl(authorizationUrl);

  return errors;
};

export class Oauth2SSOConfigurationModal extends React.Component<Props> {
  static defaultProps = {
    id: null,
    name: null,
    secret: null,
    clientId: null,
    logoutUrl: null,
    profileUrl: null,
    userInfoUrl: null,
    accessTokenUrl: null,
    authorizationUrl: null,
  };

  render() {
    const {
      show,
      isCreating,
      onClose,
      pristine,
      invalid,
      handleSubmit,
      submitting,
      intl,
      valid,
      submitSucceeded,
      submitFailed,
    } = this.props;
    return (
      <Modal show={show} onHide={onClose} aria-labelledby="oauth2-sso-modal-lg">
        <form onSubmit={handleSubmit} id={`${formName}`}>
          <Modal.Header closeButton>
            <Modal.Title
              id="oauth2-sso-modal-lg"
              children={
                <FormattedMessage
                  id={
                    isCreating
                      ? intl.formatMessage({ id: 'add-an-open-id-authentication-method' })
                      : intl.formatMessage({ id: 'update-an-open-id-authentication-method' })
                  }
                />
              }
            />
          </Modal.Header>
          <Modal.Body>
            <Field
              id={`${formName}_name`}
              name="name"
              type="text"
              required
              component={component}
              label={<FormattedMessage id="global.name" />}
            />
            <Field
              id={`${formName}_buttonColor`}
              name="buttonColor"
              type="text"
              required
              component={ColorPickerInput}
              label={<FormattedMessage id="color.btn.bg" />}
            />
            <Field
              id={`${formName}_labelColor`}
              name="labelColor"
              type="text"
              required
              component={ColorPickerInput}
              label={<FormattedMessage id="label-color" />}
            />
            <h4>Configuration</h4>
            <Field
              id={`${formName}_authorizationUrl`}
              name="authorizationUrl"
              type="text"
              required
              component={component}
              label={<FormattedMessage id="authorization-URL" />}
            />
            <Field
              id={`${formName}_accessTokenUrl`}
              name="accessTokenUrl"
              type="text"
              required
              component={component}
              label={<FormattedMessage id="access-token-URL" />}
            />
            <Field
              id={`${formName}_userInfoUrl`}
              name="userInfoUrl"
              type="text"
              required
              component={component}
              label={<FormattedMessage id="user-information-url" />}
            />
            <Field
              id={`${formName}_logoutUrl`}
              name="logoutUrl"
              type="text"
              component={component}
              label={<FormattedMessage id="access-disconnection-url" />}
            />
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
              id={`${formName}_profileUrl`}
              name="profileUrl"
              type="text"
              required
              component={component}
              label={<FormattedMessage id="url-user-profile-sso" />}
            />
            <Field
              id={`${formName}_redirectUri`}
              name="redirectUri"
              disabled
              type="text"
              component={component}
              label={<FormattedMessage id="sso-link" />}
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
})(Oauth2SSOConfigurationModal);

export default connect(mapStateToProps)(injectIntl(form));
