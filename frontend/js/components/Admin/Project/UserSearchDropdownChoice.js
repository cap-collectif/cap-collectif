// @flow
import React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { graphql, createFragmentContainer } from 'react-relay';
import type { UserSearchDropdownChoice_user } from '~relay/UserSearchDropdownChoice_user.graphql';
import DropdownSelectChoice from '~ui/DropdownSelect/choice';

type Props = {|
  +isIndeterminate: boolean,
  +user: UserSearchDropdownChoice_user,
|};

const UserSearchDropdownChoiceContainer: StyledComponent<
  {},
  {},
  typeof DropdownSelectChoice,
> = styled(DropdownSelectChoice)`
  & img {
    width: 18px;
    height: 18px;
    margin-right: 8px;
    border-radius: 100%;
  }
`;

const UserSearchDropdownChoice = ({ user, isIndeterminate }: Props) => {
  return (
    <UserSearchDropdownChoiceContainer isIndeterminate={isIndeterminate} value={user.id}>
      {user.avatarUrl && <img src={user.avatarUrl} alt={user.username} />}
      {user.username}
    </UserSearchDropdownChoiceContainer>
  );
};

export default createFragmentContainer(UserSearchDropdownChoice, {
  user: graphql`
    fragment UserSearchDropdownChoice_user on User {
      id
      username
      avatarUrl
    }
  `,
});
