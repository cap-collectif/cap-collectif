// @flow

import * as React from 'react';
import { useMemo, useState } from 'react';
import { Button, InputGroup, Modal } from 'react-bootstrap';
import { FormattedMessage, useIntl } from 'react-intl';
import { useUserInviteModalContext } from '~/components/Admin/UserInvite/Modal/UserInviteModal.context';
import Checkbox from '~ui/Form/Input/Checkbox/Checkbox';
import InviteUserMutation, { INVITE_USERS_MAX_RESULTS } from '~/mutations/InviteUserMutation';
import useLoadingMachine from '~/utils/hooks/useLoadingMachine';
import FluxDispatcher from '~/dispatchers/AppDispatcher';
import { UPDATE_ALERT } from '~/constants/AlertConstants';

type Props = {|
  +onSubmitSucces?: () => void,
|};

export const UserInviteModalStepChooseRole = ({ onSubmitSucces }: Props) => {
  const { dispatch, emails } = useUserInviteModalContext();
  const hasManyEmails = useMemo(() => emails.length > 1, [emails]);
  const [isAdmin, setIsAdmin] = useState(false);
  const { stopLoading, isLoading, startLoading } = useLoadingMachine();
  const intl = useIntl();
  return (
    <form
      onSubmit={async e => {
        try {
          e.preventDefault();
          const input = {
            maxResults: INVITE_USERS_MAX_RESULTS,
            emails,
            isAdmin,
          };
          startLoading();
          await InviteUserMutation.commit({
            input,
          });
          stopLoading();
          FluxDispatcher.dispatch({
            actionType: UPDATE_ALERT,
            alert: {
              bsStyle: 'success',
              content: hasManyEmails
                ? intl.formatMessage({ id: 'email-will-be-sent-to-many-users' })
                : intl.formatMessage(
                    {
                      id: 'email-will-be-sent-to-user',
                    },
                    { email: emails[0] },
                  ),
            },
          });
          // eslint is not up to date because this normally don't cause eslint to trigger an error
          // eslint-disable-next-line no-unused-expressions
          onSubmitSucces?.();
        } catch {
          stopLoading();
          FluxDispatcher.dispatch({
            actionType: UPDATE_ALERT,
            alert: {
              bsStyle: 'warning',
              content: 'global.failure',
            },
          });
        }
      }}>
      <Modal.Header closeButton>
        <Modal.Title>
          {hasManyEmails
            ? intl.formatMessage({ id: 'invite-many-emails' }, { count: emails.length })
            : intl.formatMessage({ id: 'invite-one-email' }, { email: emails[0] })}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormattedMessage id="choose-a-role" tagName="p" />
        <InputGroup>
          <Checkbox
            label={intl.formatMessage({ id: 'roles.user' })}
            id="user"
            value="user"
            name="roles[]"
            checked
          />
        </InputGroup>
        <InputGroup>
          <Checkbox
            label={intl.formatMessage({ id: 'roles.admin' })}
            id="admin"
            value="admin"
            name="roles[]"
            checked={isAdmin}
            onChange={() => {
              setIsAdmin(v => !v);
            }}
          />
        </InputGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            dispatch({ type: 'GOTO_CHOOSE_USERS_STEP' });
          }}>
          {intl.formatMessage({ id: 'global.back' })}
        </Button>
        <Button disabled={isLoading} variant="primary" type="submit">
          {intl.formatMessage({ id: 'global.validate' })}
        </Button>
      </Modal.Footer>
    </form>
  );
};

export default UserInviteModalStepChooseRole;
