// @flow
import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import type { FormProps } from 'redux-form';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage, type IntlShape } from 'react-intl';
import CloseButton from '../../Form/CloseButton';
import type { GlobalState, Uri, Uuid } from '../../../types';
import component from '../../Form/Field';

type FormValues = {|
  id: ?Uuid,
  name: ?string,
  clientId: ?string,
  secret: ?string,
  authorizationUrl: ?Uri,
  accessTokenUrl: ?Uri,
  userInfoUrl: ?Uri,
  logoutUrl: ?Uri,
  redirectUri: Uri,
  profileUrl: ?Uri,
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

const onSubmit = async (values: FormValues) => {
  const { id } = values;

  if (id === null) {
    // return create
  }

  // return update
};

export class Oauth2SSOConfigurationModal extends React.Component<Props> {
  static defaultProps = {
    id: null,
    name: null,
    clientId: null,
    secret: null,
    authorizationUrl: null,
    accessTokenUrl: null,
    userInfoUrl: null,
    logoutUrl: null,
    profileUrl: null,
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
  onSubmit,
  enableReinitialize: true,
  form: formName,
})(Oauth2SSOConfigurationModal);

export default connect(mapStateToProps)(form);
