// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import Modal from '~ds/Modal/Modal';
import Button from '~ds/Button/Button';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';
import { useUserInviteModalContext } from '~/components/Admin/UserInvite/Modal/UserInviteModal.context';
import InviteUserMutation, { INVITE_USERS_MAX_RESULTS } from '~/mutations/InviteUserMutation';
import useLoadingMachine from '~/utils/hooks/useLoadingMachine';
import { toast } from '~ds/Toast';
import Text from '~ui/Primitives/Text';
import { ModalBody } from '~/components/Admin/UserInvite/UserInviteAdminPage.style';

type Props = {|
  +onClose: () => void,
|};

const UserInviteModalStepSendingConfirmation = ({ onClose }: Props): React.Node => {
  const intl = useIntl();
  const { dispatch, emails, role, groups } = useUserInviteModalContext();
  const { stopLoading, isLoading, startLoading } = useLoadingMachine();

  const onSubmit = async () => {
    try {
      const input = {
        maxResults: INVITE_USERS_MAX_RESULTS,
        emails,
        role,
        groups: groups.map(group => group.id),
      };
      startLoading();
      await InviteUserMutation.commit({
        input,
      });
      stopLoading();
      onClose();
      toast({
        variant: 'success',
        content: intl.formatMessage({ id: 'invite-sent' }, { nbInvites: emails.length }),
      });
    } catch {
      stopLoading();
      toast({
        variant: 'danger',
        content: intl.formatMessage({ id: 'global.error.server.form' }),
      });
    }
  };

  const groupsText =
    groups.length > 0
      ? groups.map(group => `"${group.label}"`).reduce((acc, text) => `${acc} / ${text}`)
      : '';

  return (
    <>
      <Modal.Header pb={6}>
        <Text
          color={isLoading ? 'gray.300' : 'blue.900'}
          fontWeight={600}
          lineHeight="l"
          fontSize={4}>
          {intl.formatMessage({ id: 'sending-confirmation' })}
        </Text>
      </Modal.Header>
      <ModalBody color={isLoading ? 'gray.300' : ''}>
        {intl.formatMessage(
          { id: 'user-invite-sending-confirmation-body' },
          { nbInvites: emails.length },
        )}
        {groups.length > 0 &&
          intl.formatMessage(
            { id: 'user-invite-sending-confirmation-body-groups' },
            { nbInvites: emails.length, groups: groupsText, nbGroups: groups.length },
          )}
      </ModalBody>
      <Modal.Footer as="div" pt={6}>
        <ButtonGroup>
          <Button
            variant="tertiary"
            variantSize="big"
            variantColor="hierarchy"
            onClick={() => dispatch({ type: 'GOTO_ROLE_STEP', payload: emails })}>
            <Text color={isLoading ? 'gray.300' : ''}>
              {intl.formatMessage({ id: 'global.back' })}
            </Text>
          </Button>
          <Button variant="primary" variantSize="big" isLoading={isLoading} onClick={onSubmit}>
            {isLoading
              ? intl.formatMessage({ id: 'user.confirm.sending' })
              : intl.formatMessage({ id: 'global.send' })}
          </Button>
        </ButtonGroup>
      </Modal.Footer>
    </>
  );
};

export default UserInviteModalStepSendingConfirmation;
