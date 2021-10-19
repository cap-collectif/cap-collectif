// @flow
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import ListGroup from '../../Ui/List/ListGroup';
import SSOConfigurationItem from './SSOConfigurationItem';
import Oauth2SSOConfigurationModal from './Oauth2SSOConfigurationModal';
import type { ListCustomSSO_query } from '~relay/ListCustomSSO_query.graphql';

type RelayProps = {|
  +query: ListCustomSSO_query,
|};

type Props = {|
  ...RelayProps,
|};

const CUSTOM_PROVIDERS = ['Oauth2SSOConfiguration'];

export const ListCustomSSO = ({ query }: Props) => {
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleClose = () => {
    setShowModal(false);
  };

  const ssoConfigurations = query?.ssoConfigurations;

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
  query: graphql`
    fragment ListCustomSSO_query on Query {
      ssoConfigurations(first: 100) @connection(key: "ListCustomSSO_ssoConfigurations") {
        edges {
          node {
            __typename
            ...SSOConfigurationItem_configuration
          }
        }
      }
    }
  `,
});
