// @flow
import * as React from 'react';
import { number } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import Avatar from '../../../components/Ui/Medias/Avatar';

import UserAvatarList from '../../../components/Ui/List/UserAvatarList';

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
  .add('with 150 votes', () => {
    const users = usersMockGenerator(150);
    const max = number('Max display', 5);

    return (
      <UserAvatarList max={max}>
        {users.map((user, index) => (
          <Avatar alt={author.username} src={user.media.url} key={index} />
        ))}
      </UserAvatarList>
    );
  });
