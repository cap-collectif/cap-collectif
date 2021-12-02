// @flow
import * as React from 'react';
import { FormattedHTMLMessage, useIntl } from 'react-intl';
import { Radio } from 'react-bootstrap';
import Modal from '~ds/Modal/Modal';
import { ICON_NAME } from '~ds/Icon/Icon';
import Text from '~ui/Primitives/Text';
import Button from '~ds/Button/Button';
import Heading from '~ui/Primitives/Heading';
import Flex from '~ui/Primitives/Layout/Flex';
import type { UserInviteStatus } from '~relay/UserInviteList_query.graphql';
import RelaunchUserInvitationsMutation from '~/mutations/RelaunchUserInvitationsMutation';
import { toast } from '~ds/Toast';
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast';

type UserInvite = {|
  +id: string,
  +email: string,
  +isAdmin: boolean,
  +isProjectAdmin: boolean,
  +status: UserInviteStatus,
  +groups: {|
    +edges: ?$ReadOnlyArray<?{|
      +node: {|
        +title: ?string,
      |},
    |}>,
  |},
  +relaunchCount: number,
|};

type Props = {|
  +invitations: Array<UserInvite>,
|};

const onSubmit = (invitations, intl) => {
  const emails = invitations.map(invitation => invitation.email);
  const input = { emails };

  return RelaunchUserInvitationsMutation.commit({
    input,
  })
    .then(() => {
      toast({
        variant: 'success',
        content: intl.formatMessage({ id: 'invite-sent' }, { nbInvites: emails.length }),
      });
    })
    .catch(() => {
      mutationErrorToast(intl);
    });
};

export const UserInviteRelaunchInvitations = ({ invitations }: Props): React.Node => {
  const intl = useIntl();
  const [exclude, setExclude] = React.useState(false);
  const relaunchableInvitations = invitations.filter(invitation => invitation.status === 'EXPIRED');
  const relaunchedInvitations = relaunchableInvitations.filter(
    invitation => invitation.relaunchCount > 0,
  );
  const notRelaunchedInvitations = relaunchableInvitations.filter(
    invitation => invitation.relaunchCount === 0,
  );
  const invitationsToRelaunched = exclude ? notRelaunchedInvitations : relaunchableInvitations;

  return (
    <Modal
      ariaLabel={intl.formatMessage({ id: 'invitations.confirm.relaunch' })}
      disclosure={
        <Button
          variantSize="small"
          disabled={relaunchableInvitations.length === 0}
          variant="primary"
          leftIcon={ICON_NAME.ENVELOPE_O}>
          {intl.formatMessage({ id: 'invitations.relaunch' })}
        </Button>
      }>
      {({ hide }) => (
        <>
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: 'invitations.relaunch.confirm' })}</Heading>
          </Modal.Header>
          <Modal.Body>
            <Flex direction="row" mt={2}>
              <Text>
                <FormattedHTMLMessage
                  tagName="span"
                  id="invitations.relaunch.message"
                  values={{
                    invitationsCount: relaunchableInvitations.length,
                  }}
                />
                {relaunchedInvitations.length > 0 && relaunchableInvitations.length > 1 ? (
                  <FormattedHTMLMessage
                    tagName="span"
                    id="invitations.relaunch.messages-relaunch"
                    values={{ relaunchedInvitations: relaunchedInvitations.length }}
                  />
                ) : (
                  <FormattedHTMLMessage
                    tagName="span"
                    id="invitations.relaunch.message-relaunch"
                    values={{ relaunchedInvitations: relaunchedInvitations.length }}
                  />
                )}
              </Text>
            </Flex>
            {relaunchableInvitations.length > 1 && relaunchedInvitations.length > 0 && (
              <Flex direction="column" mt={4} ml={4}>
                <Radio
                  name="include-invitations"
                  value={false}
                  checked={exclude === false ? 'checked' : ''}
                  onChange={() => {
                    setExclude(false);
                  }}>
                  {intl.formatMessage(
                    { id: 'invitations.relaunch.include' },
                    { relaunchedInvitations: relaunchedInvitations.length },
                  )}
                </Radio>
                <Radio
                  name="exclude-invitations"
                  value
                  checked={exclude === true ? 'checked' : ''}
                  onChange={() => {
                    setExclude(true);
                  }}>
                  {intl.formatMessage(
                    { id: 'invitations.relaunch.exclude' },
                    { relaunchedInvitations: relaunchedInvitations.length },
                  )}
                </Radio>
              </Flex>
            )}
          </Modal.Body>
          <Modal.Footer spacing={2}>
            <Button color="gray.400" variantColor="hierarchy" variantSize="medium" onClick={hide}>
              {intl.formatMessage({ id: 'global.cancel' })}
            </Button>
            <Button
              variant="primary"
              variantSize="medium"
              onClick={() => {
                onSubmit(invitationsToRelaunched, intl);
                hide();
              }}>
              {intl.formatMessage({ id: 'global.confirm' })}
            </Button>
          </Modal.Footer>
        </>
      )}
    </Modal>
  );
};

export default UserInviteRelaunchInvitations;
