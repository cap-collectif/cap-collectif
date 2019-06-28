// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { Button, Tooltip, OverlayTrigger } from 'react-bootstrap';

import { UserAvatar } from './UserAvatar';
import type { UserAvatarList_users } from '~relay/UserAvatarList_users.graphql';

type Props = {
  users: UserAvatarList_users,
  max: number,
};

export const UserAvatarList = (props: Props) => {
  const { users, max } = props;

  return (
    <React.Fragment>
      {users &&
        users.slice(0, max).map((user, index) => (
          <span className="mr-5">
            <OverlayTrigger
              key={index}
              placement="top"
              overlay={<Tooltip id={`opinion-vote-tooltip-${user.id}`}>{user.username}</Tooltip>}>
              {/* $FlowFixMe */}
              <UserAvatar user={user} />
            </OverlayTrigger>
          </span>
        ))}
      {users.length > 5 && (
        <span>
          <Button
            bsStyle="link"
            id="opinion-votes-show-all"
            onClick={() => {}}
            className="opinion__votes__more__link text-center">
            {`+${users.length - max >= 100 ? '99' : users.length - max}`}
          </Button>
        </span>
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
      url
      username
      media {
        url
      }
    }
  `,
});
