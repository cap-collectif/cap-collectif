// @flow

import * as React from 'react';
import { useCallback } from 'react';
import { useInput } from '@liinkiing/react-hooks';
import { Button, Modal } from 'react-bootstrap';
import { fetchQuery_DEPRECATED, graphql } from 'react-relay';
import { useIntl } from 'react-intl';
import Input from '~ui/Form/Input/Input';
import environment from '~/createRelayEnvironment';
import { isEmail } from '~/services/Validator';
import { useUserInviteModalContext } from '~/components/Admin/UserInvite/Modal/UserInviteModal.context';
import useLoadingMachine from '~/utils/hooks/useLoadingMachine';

const USER_SEARCH_QUERY = graphql`
  query UserInviteByEmailStepChooseUsersQuery($displayName: String!) {
    userSearch(displayName: $displayName) {
      id
      email
    }
  }
`;

type Props = {|
  +onCloseButtonClick?: () => void,
|};

export const UserInviteByEmailStepChooseUsers = ({ onCloseButtonClick }: Props) => {
  const { dispatch } = useUserInviteModalContext();
  const intl = useIntl();
  const [email] = useInput('');
  const {
    triggerError,
    stopLoading,
    isLoading,
    hasError,
    errorMessage,
    startLoading,
  } = useLoadingMachine();
  const isValid = isEmail(email.value) && !isLoading;

  const searchUsers = useCallback(
    (displayName: string) => {
      startLoading();
      return fetchQuery_DEPRECATED(environment, USER_SEARCH_QUERY, {
        displayName,
      }).then(results => {
        stopLoading();
        return results;
      });
    },
    [startLoading, stopLoading],
  );

  const onSubmit = async () => {
    if (!isValid) return;
    try {
      const data = await searchUsers(email.value);
      if (data.userSearch.length > 0) {
        triggerError(intl.formatMessage({ id: 'user-already-exist' }));
      } else {
        dispatch({ type: 'GOTO_ROLE_STEP', payload: [email.value] });
      }
    } catch (e) {
      triggerError(e.message);
    }
  };
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit();
      }}>
      <Modal.Header closeButton>
        <Modal.Title>{intl.formatMessage({ id: 'invite-a-user' })}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Input
          id="email"
          required
          disabled={isLoading}
          {...email}
          placeholder={intl.formatMessage({ id: 'enter-email-address' })}
          type="email"
          name="email"
        />
        {hasError && <p className="mt-10">{errorMessage}</p>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCloseButtonClick}>
          {intl.formatMessage({ id: 'global.close' })}
        </Button>
        <Button disabled={!isValid} variant="primary" type="submit">
          {intl.formatMessage({ id: 'global.next' })}
        </Button>
      </Modal.Footer>
    </form>
  );
};

export default UserInviteByEmailStepChooseUsers;
