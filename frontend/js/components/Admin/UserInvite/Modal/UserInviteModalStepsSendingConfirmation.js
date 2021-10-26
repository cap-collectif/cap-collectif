// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { formValueSelector } from 'redux-form';
import Flex from '~ui/Primitives/Layout/Flex';
import type { GlobalState } from '~/types';
import { isEmail } from '~/services/Validator';
import { emailSeparator } from '~/components/Admin/UserInvite/Modal/UserInviteModalSteps';
import SpotIcon, { SPOT_ICON_NAME, SPOT_ICON_SIZE } from '~ds/SpotIcon/SpotIcon';

const UserInviteModalStepsSendingConfirmation = (): React.Node => {
  const intl = useIntl();
  const csvEmails = useSelector((state: GlobalState) =>
    formValueSelector('form-user-invitation')(state, 'csvEmails'),
  );
  const inputEmails = useSelector((state: GlobalState) =>
    formValueSelector('form-user-invitation')(state, 'inputEmails'),
  );
  const groups = useSelector((state: GlobalState) =>
    formValueSelector('form-user-invitation')(state, 'groups'),
  );
  const formattedInputEmails = inputEmails.split(emailSeparator).filter(email => isEmail(email));

  const groupsText =
    groups.length > 0
      ? groups.map(group => `"${group.label}"`).reduce((acc, text) => `${acc} / ${text}`)
      : '';

  return (
    <Flex
      fontWeight="semibold"
      direction="column"
      spacing={4}
      align="center"
      justify="center"
      textAlign="center">
      <SpotIcon className="pb-4" name={SPOT_ICON_NAME.MAIL} size={SPOT_ICON_SIZE.LG} />
      {intl.formatMessage(
        { id: 'user-invite-sending-confirmation-body' },
        { nbInvites: csvEmails.importedUsers.length + formattedInputEmails.length },
      )}
      {groups.length > 0 &&
        intl.formatMessage(
          { id: 'user-invite-sending-confirmation-body-groups' },
          {
            nbInvites: csvEmails.importedUsers.length + formattedInputEmails.length,
            groups: groupsText,
            nbGroups: groups.length,
          },
        )}
    </Flex>
  );
};

export default UserInviteModalStepsSendingConfirmation;
