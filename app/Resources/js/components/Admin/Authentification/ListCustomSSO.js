// @flow
import * as React from 'react';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import ListGroup from '../../Ui/List/ListGroup';
import SSOConfigurationItem from './SSOConfigurationItem';
import Oauth2SSOConfigurationModal from './Oauth2SSOConfigurationModal';
import type { ListCustomSSO_ssoConfigurations } from '~relay/ListCustomSSO_ssoConfigurations.graphql';

type RelayProps = {|
  +ssoConfigurations: ListCustomSSO_ssoConfigurations,
|};

type Props = {|
  ...RelayProps,
|};

type State = {|
  showModal: boolean,
|};

const CUSTOM_PROVIDERS = ['Oauth2SSOConfiguration'];

export class ListCustomSSO extends React.Component<Props, State> {
  state = {
    showModal: false,
  };

  handleClose = () => {
    this.setState({ showModal: false });
  };

  render() {
    const { ssoConfigurations } = this.props;
    const { showModal } = this.state;

    const filteredSSOConfigurations =
      ssoConfigurations.edges &&
      ssoConfigurations.edges
        .filter(Boolean)
        .map(edge => edge.node)
        .filter(Boolean)
        .filter(node => CUSTOM_PROVIDERS.includes(node.__typename));

    return (
      <>
        <ListGroup>
          {filteredSSOConfigurations && filteredSSOConfigurations.length > 0 ? (
            <>
              {filteredSSOConfigurations.map((node, key) => (
                <>
                  <SSOConfigurationItem configuration={node} key={key} />
                </>
              ))}
            </>
          ) : (
            <FormattedMessage id="no-method-configured" />
          )}
        </ListGroup>
        <Button
          bsStyle="primary"
          className="mt-15"
          onClick={() => {
            this.setState((prevState: State) => ({
              ...prevState,
              showModal: !prevState.showModal,
            }));
          }}>
          <FormattedMessage id="global.add" />
        </Button>
        <Oauth2SSOConfigurationModal show={showModal} onClose={this.handleClose} isCreating />
      </>
    );
  }
}

export default createFragmentContainer(ListCustomSSO, {
  ssoConfigurations: graphql`
    fragment ListCustomSSO_ssoConfigurations on InternalSSOConfigurationConnection {
      edges {
        node {
          __typename
          ...SSOConfigurationItem_configuration
        }
      }
    }
  `,
});
