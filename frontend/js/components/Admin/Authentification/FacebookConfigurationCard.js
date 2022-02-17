// @flow
import { graphql, useFragment } from 'react-relay';
import React from 'react';
import Toggle from '~/components/Ui/Toggle/Toggle';
import FacebookConfigurationModal from '~/components/Admin/Authentification/FacebookConfigurationModal';
import { toggle } from '~/mutations/UpdateFacebookSSOConfigurationMutation';
import type { FacebookConfigurationCard_ssoConfiguration$key } from '~relay/FacebookConfigurationCard_ssoConfiguration.graphql';
import AppBox from '~ui/Primitives/AppBox';

type Props = {|
  ssoConfiguration: ?FacebookConfigurationCard_ssoConfiguration$key,
  ssoConfigurationConnectionId: string,
|};

const FRAGMENT = graphql`
  fragment FacebookConfigurationCard_ssoConfiguration on FacebookSSOConfiguration {
    ...FacebookConfigurationModal_ssoConfiguration
    __typename
    clientId
    secret
    enabled
  }
`;

export const FacebookConfigurationCard = ({
  ssoConfiguration: ssoConfigurationFragment,
  ssoConfigurationConnectionId,
}: Props) => {
  const ssoConfiguration = useFragment(FRAGMENT, ssoConfigurationFragment);

  return (
    <>
      <Toggle
        id="toggle-facebook"
        checked={ssoConfiguration?.enabled}
        onChange={() => {
          if (ssoConfiguration) {
            toggle(ssoConfiguration, ssoConfigurationConnectionId);
          }
        }}
        label={<h5 className="mb-0 mt-0">Facebook</h5>}
      />
      <AppBox marginLeft="auto">
        <FacebookConfigurationModal
          ssoConfiguration={ssoConfiguration}
          ssoConfigurationConnectionId={ssoConfigurationConnectionId}
        />
      </AppBox>
    </>
  );
};

export default FacebookConfigurationCard;
