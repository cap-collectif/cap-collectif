// @flow
import * as React from 'react';
import AvatarGroup from '~ds/AvatarGroup/AvatarGroup';
import Avatar from '~ds/Avatar/Avatar';

export default {
  title: 'Design system/AvatarGroup',
  component: AvatarGroup,
  argTypes: {
    max: {
      control: { type: 'number' },
      description: 'Maximum number of avatars to show',
      defaultValue: 5,
    },
    size: {
      control: { type: 'select', options: ['sm', 'md', 'lg', 'xl'] },
      description: 'Size of the avatars',
    },
    stacked: { control: { type: 'boolean' }, description: 'is Stacked' },
  },
};
const Template = (args: any) => (
  <AvatarGroup {...args}>
    <Avatar name="Mikasa Estucasa" src="https://risibank.fr/cache/stickers/d1261/126102-full.png" />
    <Avatar name="Dan Abramov" src="https://bit.ly/dan-abramov" />
    <Avatar name="John Mark" />
    <Avatar name="Dan Abramov" src="https://bit.ly/dan-abramov" />
    <Avatar name="John Cena" />
    <Avatar name="Dan Abramov" bg="yellow.700" />
    <Avatar name="Omar Jbara" />
    <Avatar name="John Doe" />
  </AvatarGroup>
);
export const main = Template.bind({});
main.storyName = 'Default';
main.args = {};
