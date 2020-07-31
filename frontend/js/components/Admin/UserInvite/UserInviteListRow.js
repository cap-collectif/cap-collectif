// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { graphql, useFragment } from 'relay-hooks';
import { useIntl } from 'react-intl';
import PickableList from '~ui/List/PickableList';
import type { UserInviteListRow_invitation } from '~relay/UserInviteListRow_invitation.graphql';
import colors from '~/utils/colors';

const FRAGMENT = graphql`
  fragment UserInviteListRow_invitation on UserInvite {
    id
    email
    isAdmin
  }
`;

type RelayProps = {|
  +invitation: UserInviteListRow_invitation,
|};

type Props = {|
  ...RelayProps,
  +rowId: string,
|};

const UserRole: StyledComponent<{}, {}, HTMLParagraphElement> = styled.p`
  color: ${colors.secondGray};
  margin-left: auto;
`;

const Row: StyledComponent<{}, {}, typeof PickableList.Row> = styled(PickableList.Row)`
  display: flex;
  flex: 1;
  padding-right: 15px;
`;

export const UserInviteListRow = ({ invitation: inviteFragment, rowId }: Props) => {
  const intl = useIntl();
  const { email, isAdmin } = useFragment(FRAGMENT, inviteFragment);
  return (
    <Row rowId={rowId}>
      <p>{email}</p>
      <UserRole>
        {isAdmin
          ? intl.formatMessage({ id: 'roles.admin' })
          : intl.formatMessage({ id: 'roles.user' })}
      </UserRole>
    </Row>
  );
};

export default UserInviteListRow;
