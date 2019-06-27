// @flow
import * as React from 'react';
import { Button, Tooltip, OverlayTrigger } from 'react-bootstrap';

import { UserAvatar } from './UserAvatar';

type Props = {
  users: Array<Object>,
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
