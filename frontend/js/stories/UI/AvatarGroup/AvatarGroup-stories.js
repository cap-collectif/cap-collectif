// @flow
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { number, select } from 'storybook-addon-knobs';
import AvatarGroup from '~ds/AvatarGroup/AvatarGroup';
import Avatar from '~ds/Avatar/Avatar';

const max = () => number('Max items', 3, { range: true, min: 1, max: 8 });
const size = () => select('Size', { sm: 'sm', md: 'md', lg: 'lg', xl: 'xl' }, 'xl');

storiesOf('Design system|AvatarGroup', module).add('default', () => {
  return (
    <AvatarGroup size={size()} max={max()}>
      <Avatar
        name="Mikasa Estucasa"
        src="https://risibank.fr/cache/stickers/d1261/126102-full.png"
      />
      <Avatar name="Dan Abramov" src="https://bit.ly/dan-abramov" />
      <Avatar name="John Mark" />
      <Avatar name="Dan Abramov" src="https://bit.ly/dan-abramov" />
      <Avatar name="John Cena" />
      <Avatar name="Dan Abramov" bg="yellow.700" />
      <Avatar name="Omar Jbara" />
      <Avatar name="John Doe" />
    </AvatarGroup>
  );
});
