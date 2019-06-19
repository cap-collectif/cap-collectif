// @flow
import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import type { FormProps } from 'redux-form';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
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
|};

type Props = {|
  show: boolean,
  onClose: () => void,
  isCreating: boolean,
  ...FormValues,
  ...FormProps,
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
  render() {
    const { show, isCreating, onClose, pristine, invalid, handleSubmit, submitting } = this.props;
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
                      ? "Ajouter une méthode d'authentification Open ID"
                      : "Modifier une méthode d'authentification Open ID"
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
              label={<span>Nom</span>}
            />
            <h4>Configuration</h4>
            <Field
              id={`${formName}_authorizationUrl`}
              name="authorizationUrl"
              type="text"
              required
              component={component}
              label={<span>URL d'autorisation</span>}
            />
            <Field
              id={`${formName}_accessTokenUrl`}
              name="accessTokenUrl"
              type="text"
              required
              component={component}
              label={<span>URL du jeton d'accès</span>}
            />
            <Field
              id={`${formName}_userInfoUrl`}
              name="userInfoUrl"
              type="text"
              required
              component={component}
              label={<span>URL d'information utilisateur</span>}
            />
            <Field
              id={`${formName}_logoutUrl`}
              name="logoutUrl"
              type="text"
              component={component}
              label={<span>URL de déconnexion</span>}
            />
            <Field
              id={`${formName}_clientId`}
              name="clientId"
              type="text"
              required
              component={component}
              label={<span>ID Client</span>}
            />
            <Field
              id={`${formName}_secret`}
              name="secret"
              type="text"
              required
              component={component}
              label={<span>Clé secrète</span>}
            />
            <Field
              id={`${formName}_link`}
              name="link"
              disabled
              type="text"
              component={component}
              label={<span>Lien de l'authentification unique</span>}
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

  static defaultProps = {
    id: null,
    name: null,
    clientId: null,
    secret: null,
    authorizationUrl: null,
    accessTokenUrl: null,
    userInfoUrl: null,
    logoutUrl: null,
  };
}

const mapStateToProps = (state: GlobalState, props: Props) => ({
  initialValues: {
    ...props,
    link: 'https://test.com/',
  },
});

const form = reduxForm({
  onSubmit,
  enableReinitialize: true,
  form: formName,
})(Oauth2SSOConfigurationModal);

export default connect(mapStateToProps)(form);
