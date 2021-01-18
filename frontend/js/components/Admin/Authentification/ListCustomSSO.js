// @flow
import React, { useState } from 'react';
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

const CUSTOM_PROVIDERS = ['Oauth2SSOConfiguration'];

export const ListCustomSSO = ({ ssoConfigurations }: Props) => {
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleClose = () => {
    setShowModal(false);
  };

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
              <SSOConfigurationItem configuration={node} key={key} />
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
          setShowModal(!showModal);
        }}>
        <FormattedMessage id="global.add" />
      </Button>
      <Oauth2SSOConfigurationModal show={showModal} onClose={handleClose} isCreating />
    </>
  );
};

export default createFragmentContainer(ListCustomSSO, {
  ssoConfigurations: graphql`
    fragment ListCustomSSO_ssoConfigurations on SSOConfigurationConnection {
      edges {
        node {
          __typename
          ...SSOConfigurationItem_configuration
        }
      }
    }
  `,
});
