// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { Button, ButtonToolbar } from 'react-bootstrap';
import { FormattedMessage, type IntlShape } from 'react-intl';
import type { Oauth2SSOConfigurationItem_configuration } from '~relay/Oauth2SSOConfigurationItem_configuration.graphql';
import Oauth2SSOConfigurationModal from './Oauth2SSOConfigurationModal';

type RelayProps = {|
  +configuration: Oauth2SSOConfigurationItem_configuration,
|};

type Props = {|
  ...RelayProps,
  intl: IntlShape,
|};

type State = {|
  showModal: boolean,
|};

export class Oauth2SSOConfigurationItem extends React.Component<Props, State> {
  state = {
    showModal: false,
  };

  handleClose = () => {
    this.setState({ showModal: false });
  };

  render() {
    const { configuration, intl } = this.props;
    const { showModal } = this.state;

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
                showModal: !prevState.showModal,
              }));
            }}>
            <i className="fa fa-pencil" /> <FormattedMessage id="global.edit" />
          </Button>
          <Button
            bsStyle="danger"
            className="btn-outline-danger"
            onClick={() => {
              if (
                // eslint-disable-next-line no-alert
                window.confirm(
                  intl.formatMessage({
                    id: 'are-you-sure-you-want-to-delete-the-authentication-method',
                  }),
                )
              ) {
                // remove mutation with configuration.id
              }
            }}>
            <i className="fa fa-trash" />
          </Button>
        </ButtonToolbar>
        <Oauth2SSOConfigurationModal
          show={showModal}
          onClose={this.handleClose}
          {...configuration}
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
    }
  `,
});
