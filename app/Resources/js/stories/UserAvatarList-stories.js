// @flow
import * as React from 'react';
import { number } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';

import { UserAvatarList } from '../components/User/UserAvatarList';

import { author } from './mocks/users';

const usersMockGenerator = nb => new Array(nb).fill(author);

storiesOf('UserAvatarList', module)
  .add('default case', () => {
    const users = usersMockGenerator(4);
    const max = number('Max display', 5);

    // $FlowFixMe $refType
    return <UserAvatarList users={users} max={max} />;
  })
  .add('with 150 votes', () => {
    const users = usersMockGenerator(150);
    const max = number('Max display', 5);

    // $FlowFixMe $refType
    return <UserAvatarList users={users} max={max} />;
  });
