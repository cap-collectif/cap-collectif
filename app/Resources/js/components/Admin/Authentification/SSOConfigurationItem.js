// @flow
import * as React from 'react';
import { ListGroupItem } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import type { SSOConfigurationItem_configuration } from '~relay/SSOConfigurationItem_configuration.graphql';
import Oauth2SSOConfigurationItem from './Oauth2SSOConfigurationItem';

type RelayProps = {|
  +configuration: SSOConfigurationItem_configuration,
|};

type Props = {|
  ...RelayProps,
|};

const getConcreteSSOElementItem = (
  configuration: SSOConfigurationItem_configuration,
): React.Node => {
  switch (configuration.__typename) {
    case 'Oauth2SSOConfiguration':
      /* $FlowFixMe $refType */
      return <Oauth2SSOConfigurationItem configuration={configuration} />;
    default:
      return (
        <div>
          <FormattedMessage id="open-id-authentication-method" />
        </div>
      );
  }
};

export class SSOConfigurationItem extends React.Component<Props> {
  render() {
    const { configuration } = this.props;

    return <ListGroupItem>{getConcreteSSOElementItem(configuration)}</ListGroupItem>;
  }
}

export default createFragmentContainer(SSOConfigurationItem, {
  configuration: graphql`
    fragment SSOConfigurationItem_configuration on SSOConfiguration {
      __typename
      ... on Oauth2SSOConfiguration {
        ...Oauth2SSOConfigurationItem_configuration
      }
    }
  `,
});
