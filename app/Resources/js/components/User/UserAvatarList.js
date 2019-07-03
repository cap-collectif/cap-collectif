// @flow
import * as React from 'react';
import styled from 'styled-components';
import { graphql, createFragmentContainer } from 'react-relay';
import { Button, Tooltip, OverlayTrigger } from 'react-bootstrap';

import UserAvatar from './UserAvatar';
import type { UserAvatarList_users } from '~relay/UserAvatarList_users.graphql';

type Props = {
  users: UserAvatarList_users,
  max: number,
  onClick?: Function,
};

const AvatarButton = styled.button.attrs({})`
  outline: none;
  border: none;
  background: none;
`;

export const UserAvatarList = (props: Props) => {
  const { users, max, onClick } = props;

  return (
    <React.Fragment>
      {users &&
        users.slice(0, max).map((user, index) => (
          <AvatarButton onClick={onClick}>
            <OverlayTrigger
              key={index}
              placement="top"
              overlay={<Tooltip id={`tooltip-${user.id}`}>{user.username}</Tooltip>}>
              {/* $FlowFixMe */}
              <UserAvatar user={user} />
            </OverlayTrigger>
          </AvatarButton>
        ))}
      {users.length > 5 && (
        <AvatarButton onClick={onClick}>
          <Button
            bsStyle="link"
            id="show-all"
            onClick={() => {}}
            className="more__link text-center">
            {`+${users.length - max >= 100 ? '99' : users.length - max}`}
          </Button>
        </AvatarButton>
      )}
    </React.Fragment>
  );
};

UserAvatarList.defaultProps = {
  max: 5,
};

export default createFragmentContainer(UserAvatarList, {
  users: graphql`
    fragment UserAvatarList_users on User @relay(plural: true) {
      id
      username
      ...UserAvatar_user
    }
  `,
});
