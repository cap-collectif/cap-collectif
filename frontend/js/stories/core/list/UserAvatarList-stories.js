// @flow
import * as React from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';
import { number } from 'storybook-addon-knobs';
import { storiesOf } from '@storybook/react';
import Avatar from '~/components/Ui/Medias/Avatar';
import UserAvatarList from '~/components/Ui/List/UserAvatarList';

import { author } from '../../mocks/users';

const usersMockGenerator = nb => new Array(nb).fill(author);

storiesOf('Core|List/UserAvatarList', module)
  .add('default case', () => {
    const users = usersMockGenerator(4);
    const max = number('Max display', 5);

    return (
      <UserAvatarList max={max}>
        {users.map((user, index) => (
          <Avatar alt={author.username} src={user.media.url} key={index} />
        ))}
      </UserAvatarList>
    );
  })
  .add('with 150 users', () => {
    const users = usersMockGenerator(150);
    const max = number('Max display', 5);

    return (
      <UserAvatarList max={max}>
        {users.map((user, index) => (
          <Avatar alt={author.username} src={user.media.url} key={index} />
        ))}
      </UserAvatarList>
    );
  })
  .add('with space', () => {
    const users = usersMockGenerator(150);
    const max = number('Max display', 5);

    return (
      <UserAvatarList max={max} spaceBetweenAvatar={10}>
        {users.map((user, index) => (
          <Avatar alt={author.username} src={user.media.url} key={index} />
        ))}
      </UserAvatarList>
    );
  })
  .add('with tooltip', () => {
    const users = usersMockGenerator(150);
    const max = number('Max display', 5);
    const hiddenAvatarTooltip = <span>Rest of user</span>;

    return (
      <UserAvatarList max={max} hiddenAvatarTooltip={hiddenAvatarTooltip}>
        {users.map((user, index) => (
          <OverlayTrigger
            key={index}
            placement="top"
            overlay={<Tooltip id={`avatar-${index}`}>{author.username}</Tooltip>}>
            <div>
              <Avatar alt={author.username} src={user.media.url} key={index} />
            </div>
          </OverlayTrigger>
        ))}
      </UserAvatarList>
    );
  });
