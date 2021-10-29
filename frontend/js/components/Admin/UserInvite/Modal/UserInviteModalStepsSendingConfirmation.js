// @flow
import * as React from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Field, formValueSelector } from 'redux-form';
import Flex from '~ui/Primitives/Layout/Flex';
import type { GlobalState } from '~/types';
import { isEmail } from '~/services/Validator';
import { emailSeparator } from '~/components/Admin/UserInvite/Modal/UserInviteModalSteps';
import Text from '~ui/Primitives/Text';
import component from '~/components/Form/Field';
import { FontWeight } from '~ui/Primitives/constants';

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
    <Flex direction="column" spacing={4}>
      <Text fontWeight={FontWeight.Semibold} mr={2}>
        {intl.formatMessage({ id: 'invitations-redirection.title' })}
      </Text>
      <Text color="gray.400">
        {intl.formatMessage({ id: 'invitations-redirection.description' })}
      </Text>
      <Flex direction="row">
        <Text mr={2}>{intl.formatMessage({ id: 'invitations-redirection.label' })}</Text>
        <Text color="gray.400">{intl.formatMessage({ id: 'global.optional' })}</Text>
      </Flex>
      <Field
        type="text"
        placeholder={intl.formatMessage({ id: 'invitations-redirection.placeholder' })}
        name="redirectionUrl"
        component={component}
        id="redirection-url"
      />
      <Flex direction="row" fontWeight={FontWeight.Semibold}>
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
    </Flex>
  );
};

export default UserInviteModalStepsSendingConfirmation;
