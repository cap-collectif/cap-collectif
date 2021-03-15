// @flow
import * as React from 'react';
import Flex from '~ui/Primitives/Layout/Flex';
import Avatar from '~ds/Avatar/Avatar';
import Text from '~ui/Primitives/Text';

export default { title: 'Design system/Avatar', component: Avatar };
const Template = () => (
  <Flex gridGap={2} wrap="wrap" align="center">
    <Flex align="center" direction="column">
      <Avatar size="xs" name="Dan Abramov" src="https://bit.ly/dan-abramov" />
      <Text>xs</Text>
    </Flex>
    <Flex align="center" direction="column">
      <Avatar size="sm" name="Dan Abramov" src="https://bit.ly/dan-abramov" />
      <Text>sm</Text>
    </Flex>
    <Flex align="center" direction="column">
      <Avatar size="md" name="Dan Abramov" bg="yellow.700" color="white" />
      <Text>md</Text>
    </Flex>
    <Flex align="center" direction="column">
      <Avatar size="lg" name="Omar Jbara" />
      <Text>lg</Text>
    </Flex>
    <Flex align="center" direction="column">
      <Avatar
        size="xl"
        name="Mikasa Estucasa"
        src="https://risibank.fr/cache/stickers/d1261/126102-full.png"
      />
      <Text>xl</Text>
    </Flex>
  </Flex>
);
export const main = Template.bind({});
main.storyName = 'Default';
main.args = {};
