// @flow

import * as React from 'react';
import { useCallback } from 'react';
import { useInput } from '@liinkiing/react-hooks';
import { fetchQuery_DEPRECATED, graphql } from 'react-relay';
import { useIntl } from 'react-intl';
import Input from '~ui/Form/Input/Input';
import environment from '~/createRelayEnvironment';
import { isEmail } from '~/services/Validator';
import { useUserInviteModalContext } from '~/components/Admin/UserInvite/Modal/UserInviteModal.context';
import useLoadingMachine from '~/utils/hooks/useLoadingMachine';
import Modal from '~ds/Modal/Modal';
import Button from '~ds/Button/Button';
import ButtonGroup from '~ds/ButtonGroup/ButtonGroup';
import Heading from '~ui/Primitives/Heading';
import { ModalBody } from '~/components/Admin/UserInvite/UserInviteAdminPage.style';

const USER_SEARCH_QUERY = graphql`
  query UserInviteByEmailStepChooseUsersQuery($displayName: String!) {
    userSearch(displayName: $displayName) {
      id
      email
    }
  }
`;

type Props = {|
  +onClose: () => void,
|};

export const UserInviteByEmailStepChooseUsers = ({ onClose }: Props): React.Node => {
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
    <>
      <Modal.Header pb={6}>
        <Heading>{intl.formatMessage({ id: 'invite-a-user' })}</Heading>
      </Modal.Header>
      <ModalBody>
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
      </ModalBody>
      <Modal.Footer as="div" pt={6}>
        <ButtonGroup>
          <Button variant="tertiary" onClick={onClose} variantSize="big" variantColor="hierarchy">
            {intl.formatMessage({ id: 'global.close' })}
          </Button>
          <Button
            disabled={!isValid}
            variant="primary"
            variantSize="big"
            onClick={onSubmit}
            isLoading={isLoading}>
            {intl.formatMessage({ id: 'global.next' })}
          </Button>
        </ButtonGroup>
      </Modal.Footer>
    </>
  );
};

export default UserInviteByEmailStepChooseUsers;
