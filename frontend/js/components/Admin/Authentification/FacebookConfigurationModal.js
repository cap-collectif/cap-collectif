// @flow
import React from 'react';
import { useIntl } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import type { FacebookConfigurationModal_ssoConfiguration } from '~relay/FacebookConfigurationModal_ssoConfiguration.graphql';
import Modal from '~ds/Modal/Modal';
import Button from '~ds/Button/Button';
import FacebookConfigurationForm from "~/components/Admin/Authentification/FacebookConfigurationForm";
import {capitalizeFirstLetter} from "~/utils/string";

type Props = {|
  ssoConfiguration: ?FacebookConfigurationModal_ssoConfiguration,
  ssoConfigurationConnectionId: string
|};

export const FacebookConfigurationModal = ({ssoConfiguration, ssoConfigurationConnectionId}: Props) => {
  const intl = useIntl();

  return (
    <Modal
      ariaLabel="facebook-modal-lg"
      disclosure={
        <Button variantSize="small" variant="tertiary">
          {capitalizeFirstLetter(intl.formatMessage({ id: 'global.configure' }))}
        </Button>
      }>
      {({ hide }) => (
        <FacebookConfigurationForm ssoConfiguration={ssoConfiguration} hide={hide} ssoConfigurationConnectionId={ssoConfigurationConnectionId}/>
      )}
    </Modal>
  )
};

export default createFragmentContainer(FacebookConfigurationModal, {
  ssoConfiguration: graphql`
    fragment FacebookConfigurationModal_ssoConfiguration on FacebookSSOConfiguration {
      ... FacebookConfigurationForm_ssoConfiguration
    }
  `,
});
