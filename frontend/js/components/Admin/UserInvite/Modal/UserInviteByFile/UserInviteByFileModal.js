// @flow
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { UserInviteModalProvider } from '~/components/Admin/UserInvite/Modal/UserInviteModal.context';
import UserInviteByFileStepChooseFile from '~/components/Admin/UserInvite/Modal/UserInviteByFile/UserInviteByFileStepChooseFile';
import UserInviteModalStepChooseRole from '~/components/Admin/UserInvite/Modal/UserInviteModalStepChooseRole';

type Props = {|
  +show: boolean,
  +children?: React.Node,
  +onClose: () => void,
|};

const UserInviteByFileModal = ({ onClose, show }: Props) => {
  return (
    <Modal show={show} onHide={onClose}>
      <UserInviteModalProvider>
        {({ step }) => (
          <>
            {step === 'CHOOSE_USERS' && (
              <UserInviteByFileStepChooseFile onCloseButtonClick={onClose} />
            )}
            {step === 'CHOOSE_ROLE' && <UserInviteModalStepChooseRole onSubmitSucces={onClose} />}
          </>
        )}
      </UserInviteModalProvider>
    </Modal>
  );
};

export default UserInviteByFileModal;
