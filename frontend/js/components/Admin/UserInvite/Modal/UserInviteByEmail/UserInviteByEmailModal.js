// @flow
import * as React from 'react';
import { Modal } from 'react-bootstrap';
import { UserInviteModalProvider } from '~/components/Admin/UserInvite/Modal/UserInviteModal.context';
import UserInviteByEmailStepChooseUsers from '~/components/Admin/UserInvite/Modal/UserInviteByEmail/UserInviteByEmailStepChooseUsers';
import UserInviteModalStepChooseRole from '~/components/Admin/UserInvite/Modal/UserInviteModalStepChooseRole';

type Props = {|
  +show: boolean,
  +children?: React.Node,
  +onClose: () => void,
|};

const UserInviteByEmailModal = ({ onClose, show }: Props) => {
  return (
    <Modal show={show} onHide={onClose}>
      <UserInviteModalProvider>
        {({ step }) => (
          <>
            {step === 'CHOOSE_USERS' && (
              <UserInviteByEmailStepChooseUsers onCloseButtonClick={onClose} />
            )}
            {step === 'CHOOSE_ROLE' && <UserInviteModalStepChooseRole onSubmitSucces={onClose} />}
          </>
        )}
      </UserInviteModalProvider>
    </Modal>
  );
};

export default UserInviteByEmailModal;
