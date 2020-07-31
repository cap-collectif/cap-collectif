// @flow

import * as React from 'react';
import styled from 'styled-components';
import { Button } from 'react-bootstrap';
import { useMultipleDisclosure } from '@liinkiing/react-hooks';
import { usePreloadedQuery } from 'relay-hooks';
import { FormattedMessage } from 'react-intl';
import * as S from '~/components/Admin/UserInvite/UserInviteAdminPage.style';
import UserInviteByEmailModal from '~/components/Admin/UserInvite/Modal/UserInviteByEmail/UserInviteByEmailModal';
import UserInviteByFileModal from '~/components/Admin/UserInvite/Modal/UserInviteByFile/UserInviteByFileModal';
import UserInviteList from '~/components/Admin/UserInvite/UserInviteList';
import type { ResultPreloadQuery } from '~/types';

type RelayProps = {|
  +prefetch: ResultPreloadQuery,
|};

type Props = {|
  ...RelayProps,
|};

const ActionsContainer = styled.div`
  display: flex;
  & > *:first-of-type {
    margin-left: auto;
  }
`;

export const UserInviteAdminPage = ({ prefetch }: Props) => {
  const { props } = usePreloadedQuery(prefetch);
  const { isOpen, onOpen, onClose } = useMultipleDisclosure({
    'invite-by-user': false,
    'invite-by-file': false,
  });
  return (
    <S.UserInviteAdminPageContainer>
      <UserInviteByEmailModal show={isOpen('invite-by-user')} onClose={onClose('invite-by-user')} />
      <UserInviteByFileModal show={isOpen('invite-by-file')} onClose={onClose('invite-by-file')} />
      <div className="box-header">
        <FormattedMessage id="user-invite-admin-page-title" tagName="h3" />
      </div>
      <div className="box-content">
        <ActionsContainer className="mb-10">
          <Button className="mr-10" onClick={onOpen('invite-by-file')}>
            <FormattedMessage id="invite-via-file" />
          </Button>
          <Button onClick={onOpen('invite-by-user')}>
            <FormattedMessage id="invite-a-user" />
          </Button>
        </ActionsContainer>
        <UserInviteList query={props} />
      </div>
    </S.UserInviteAdminPageContainer>
  );
};

export default UserInviteAdminPage;
