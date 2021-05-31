// @flow

import * as React from 'react';
import { usePreloadedQuery } from 'relay-hooks';
import { FormattedMessage } from 'react-intl';
import Button from '~ds/Button/Button';
import * as S from '~/components/Admin/UserInvite/UserInviteAdminPage.style';
import UserInviteByEmailModal from '~/components/Admin/UserInvite/Modal/UserInviteByEmail/UserInviteByEmailModal';
import UserInviteByFileModal from '~/components/Admin/UserInvite/Modal/UserInviteByFile/UserInviteByFileModal';
import UserInviteList from '~/components/Admin/UserInvite/UserInviteList';
import type { ResultPreloadQuery } from '~/types';
import type {UserInviteAdminPageAppQuery} from "~relay/UserInviteAdminPageAppQuery.graphql";
import ButtonGroup from "~ds/ButtonGroup/ButtonGroup";

type RelayProps = {|
  +prefetch: ResultPreloadQuery,
|};

type Props = {|
  ...RelayProps,
|};

export const UserInviteAdminPage = ({ prefetch }: Props): React.Node => {
  const { props } = usePreloadedQuery<UserInviteAdminPageAppQuery>(prefetch);
  return (
    <S.UserInviteAdminPageContainer>
      <div className="box-header">
        <FormattedMessage id="user-invite-admin-page-title" tagName="h3" />
      </div>
      <div className="box-content">
        <ButtonGroup mb={4}>
          <UserInviteByFileModal
                                 queryFragment={props}
                                 disclosure={
                                   <Button variant="secondary" variantSize="small">
                                     <FormattedMessage id="invite-via-file" />
                                   </Button>
                                 }
          />
          <UserInviteByEmailModal queryFragment={props}
                                  disclosure={
                                    <Button variant="secondary" variantSize="small">
                                      <FormattedMessage id="invite-a-user" />
                                    </Button>
                                  }

          />
        </ButtonGroup>
        <UserInviteList query={props} />
      </div>
    </S.UserInviteAdminPageContainer>
  );
};

export default UserInviteAdminPage;
