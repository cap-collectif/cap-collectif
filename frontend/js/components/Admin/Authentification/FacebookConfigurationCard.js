// @flow
import { createFragmentContainer, graphql } from 'react-relay';
import React from 'react';
import Toggle from '~/components/Ui/Toggle/Toggle';
import FacebookConfigurationModal from '~/components/Admin/Authentification/FacebookConfigurationModal';
import { toggle } from '~/mutations/UpdateFacebookSSOConfigurationMutation';
import type { FacebookConfigurationCard_ssoConfiguration } from '~relay/FacebookConfigurationCard_ssoConfiguration.graphql';
import AppBox from "~ui/Primitives/AppBox";

type Props = {|
  ssoConfiguration: ?FacebookConfigurationCard_ssoConfiguration,
  ssoConfigurationConnectionId: string
|};

export const FacebookConfigurationCard = ({ ssoConfiguration, ssoConfigurationConnectionId }: Props) => {
  return (
    <>
      <Toggle
        id="toggle-facebook"
        checked={ssoConfiguration?.enabled}
        onChange={() => {
          if (ssoConfiguration) {
            toggle(ssoConfiguration, ssoConfigurationConnectionId)
          }
        }}
        label={
          <h5 className="mb-0 mt-0">Facebook</h5>
        }
      />
      <AppBox marginLeft="auto">
        <FacebookConfigurationModal ssoConfiguration={ssoConfiguration} ssoConfigurationConnectionId={ssoConfigurationConnectionId}/>
      </AppBox>
    </>
  );
};

export default createFragmentContainer(FacebookConfigurationCard, {
  ssoConfiguration: graphql`
    fragment FacebookConfigurationCard_ssoConfiguration on FacebookSSOConfiguration {
      ...FacebookConfigurationModal_ssoConfiguration
      __typename
      clientId
      secret
      enabled
    }
  `,
});
