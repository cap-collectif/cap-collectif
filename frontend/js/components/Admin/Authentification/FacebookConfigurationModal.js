// @flow
import React from 'react';
import { useIntl } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import type { FacebookConfigurationModal_ssoConfiguration$key } from '~relay/FacebookConfigurationModal_ssoConfiguration.graphql';
import Modal from '~ds/Modal/Modal';
import Button from '~ds/Button/Button';
import FacebookConfigurationForm from '~/components/Admin/Authentification/FacebookConfigurationForm';
import { capitalizeFirstLetter } from '~/utils/string';

type Props = {|
  ssoConfiguration: ?FacebookConfigurationModal_ssoConfiguration$key,
  ssoConfigurationConnectionId: string,
|};

const FRAGMENT = graphql`
  fragment FacebookConfigurationModal_ssoConfiguration on FacebookSSOConfiguration {
    ...FacebookConfigurationForm_ssoConfiguration
  }
`;

export const FacebookConfigurationModal = ({
  ssoConfiguration: ssoConfigurationFragment,
  ssoConfigurationConnectionId,
}: Props) => {
  const intl = useIntl();
  const ssoConfiguration = useFragment(FRAGMENT, ssoConfigurationFragment);

  return (
    <Modal
      ariaLabel="facebook-modal-lg"
      disclosure={
        <Button variantSize="small" variant="tertiary">
          {capitalizeFirstLetter(intl.formatMessage({ id: 'global.configure' }))}
        </Button>
      }>
      {({ hide }) => (
        <FacebookConfigurationForm
          ssoConfiguration={ssoConfiguration}
          hide={hide}
          ssoConfigurationConnectionId={ssoConfigurationConnectionId}
        />
      )}
    </Modal>
  );
};

export default FacebookConfigurationModal;
