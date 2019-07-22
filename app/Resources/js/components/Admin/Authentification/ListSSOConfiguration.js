// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import type { ListSSOConfiguration_ssoConfigurations } from '~relay/ListSSOConfiguration_ssoConfigurations.graphql';
import ListGroup from '../../Ui/List/ListGroup';
import SSOConfigurationItem from './SSOConfigurationItem';
import Oauth2SSOConfigurationModal from './Oauth2SSOConfigurationModal';

type RelayProps = {|
  +ssoConfigurations: ListSSOConfiguration_ssoConfigurations,
|};

type Props = {|
  ...RelayProps,
|};

type State = {|
  showModal: boolean,
|};

export class ListSSOConfiguration extends React.Component<Props, State> {
  state = {
    showModal: false,
  };

  handleClose = () => {
    this.setState({ showModal: false });
  };

  render() {
    const { ssoConfigurations } = this.props;
    const { showModal } = this.state;

    return (
      <div className="box box-primary container-fluid">
        <div className="box-header">
          <h3 className="box-title">
            <FormattedMessage id="open-id-authentication-method" />
          </h3>
        </div>
        <div className="box-content box-content__content-form">
          {ssoConfigurations.edges && ssoConfigurations.edges.length > 0 ? (
            <ListGroup>
              {ssoConfigurations.edges
                .filter(Boolean)
                .map(edge => edge.node)
                .filter(Boolean)
                .map((node, key) => (
                  /* $FlowFixMe $refType */
                  <SSOConfigurationItem configuration={node} key={key} />
                ))}
            </ListGroup>
          ) : (
            <FormattedMessage id="no-method-configured" />
          )}
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
        </div>
      </div>
    );
  }
}

export default createFragmentContainer(ListSSOConfiguration, {
  ssoConfigurations: graphql`
    fragment ListSSOConfiguration_ssoConfigurations on InternalSSOConfigurationConnection {
      edges {
        node {
          ...SSOConfigurationItem_configuration
        }
      }
    }
  `,
});
