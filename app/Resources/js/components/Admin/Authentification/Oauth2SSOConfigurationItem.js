// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, ButtonToolbar } from 'react-bootstrap';
import { createFragmentContainer, graphql } from 'react-relay';

import DeleteModal from '../../Modal/DeleteModal';
import Oauth2SSOConfigurationModal from './Oauth2SSOConfigurationModal';
import DeleteOauth2SSOConfigurationMutation from '../../../mutations/DeleteOauth2SSOConfigurationMutation';
import type { Oauth2SSOConfigurationItem_configuration } from '~relay/Oauth2SSOConfigurationItem_configuration.graphql';

type RelayProps = {|
  +configuration: Oauth2SSOConfigurationItem_configuration,
|};

type Props = {|
  ...RelayProps,
|};

type State = {|
  showModalUpdate: boolean,
  showModalDelete: boolean,
|};

const onDelete = (configurationID: string) =>
  DeleteOauth2SSOConfigurationMutation.commit({ input: { id: configurationID } });

export class Oauth2SSOConfigurationItem extends React.Component<Props, State> {
  state = {
    showModalUpdate: false,
    showModalDelete: false,
  };

  handleCloseUpdate = () => {
    this.setState({ showModalUpdate: false });
  };

  handleCloseDelete = () => {
    this.setState({ showModalDelete: false });
  };

  render() {
    const { configuration } = this.props;
    const { showModalUpdate, showModalDelete } = this.state;

    return (
      <>
        <h4>{configuration.name}</h4>
        <ButtonToolbar>
          <Button
            bsStyle="warning"
            className="btn-outline-warning"
            onClick={() => {
              this.setState((prevState: State) => ({
                ...prevState,
                showModalUpdate: !prevState.showModalUpdate,
              }));
            }}>
            <i className="fa fa-pencil" /> <FormattedMessage id="global.edit" />
          </Button>
          <Button
            bsStyle="danger"
            className="btn-outline-danger"
            onClick={() => {
              this.setState((prevState: State) => ({
                ...prevState,
                showModalDelete: !prevState.showModalDelete,
              }));
            }}>
            <i className="fa fa-trash" />
          </Button>
        </ButtonToolbar>
        <Oauth2SSOConfigurationModal
          show={showModalUpdate}
          onClose={this.handleCloseUpdate}
          {...configuration}
        />

        <DeleteModal
          closeDeleteModal={this.handleCloseDelete}
          showDeleteModal={showModalDelete}
          deleteElement={() => {
            onDelete(configuration.id);
          }}
          deleteModalTitle="are-you-sure-you-want-to-delete-the-authentication-method"
          deleteModalContent="group-admin-parameters-modal-delete-content"
        />
      </>
    );
  }
}

export default createFragmentContainer(Oauth2SSOConfigurationItem, {
  configuration: graphql`
    fragment Oauth2SSOConfigurationItem_configuration on Oauth2SSOConfiguration {
      id
      name
      clientId
      secret
      authorizationUrl
      accessTokenUrl
      userInfoUrl
      logoutUrl
      redirectUri
      profileUrl
      buttonColor
      labelColor
    }
  `,
});
