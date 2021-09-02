// @flow
import * as React from 'react';
import Modal from '~ds/Modal/Modal';
import { UserInviteModalProvider } from '~/components/Admin/UserInvite/Modal/UserInviteModal.context';
import UserInviteByFileStepChooseFile from '~/components/Admin/UserInvite/Modal/UserInviteByFile/UserInviteByFileStepChooseFile';
import UserInviteModalStepChooseRole from '~/components/Admin/UserInvite/Modal/UserInviteModalStepChooseRole';
import type { UserInviteModalStepChooseRole_query$key } from '~relay/UserInviteModalStepChooseRole_query.graphql';
import UserInviteModalStepSendingConfirmation from '~/components/Admin/UserInvite/Modal/UserInviteModalStepSendingConfirmation';

type Props = {|
  +children?: React.Node,
  +queryFragment: UserInviteModalStepChooseRole_query$key,
  +disclosure: React$Element<any>,
|};

const UserInviteByFileModal = ({ queryFragment, disclosure }: Props): React.Node => {
  return (
    <Modal ariaLabel="Modal" disclosure={disclosure} width="600px" overflow="visible">
      {({ hide }) => (
        <UserInviteModalProvider>
          {({ step }) => (
            <>
              {step === 'CHOOSE_USERS' && (
                <UserInviteByFileStepChooseFile onCloseButtonClick={hide} />
              )}
              {step === 'CHOOSE_ROLE' && (
                <UserInviteModalStepChooseRole queryFragment={queryFragment} />
              )}
              {step === 'SENDING_CONFIRMATION' && (
                <UserInviteModalStepSendingConfirmation onClose={hide} />
              )}
            </>
          )}
        </UserInviteModalProvider>
      )}
    </Modal>
  );
};

export default UserInviteByFileModal;
