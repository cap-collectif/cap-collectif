// @flow
import * as React from 'react';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';

export default {
  title: 'Design system/Primitives/Layout/Flex',
  component: Flex,
  argTypes: {
    direction: { control: { type: 'multi-select', options: ['row', 'column'] }, default: 'row' },
    spacing: { control: { type: 'number' }, default: 2 },
  },
};
const Template = (args: any) => (
  <Flex {...args}>
    <Text bg="red.300" p={1}>
      Genshin
    </Text>
    <Text bg="red.400" p={1}>
      Impact
    </Text>
    <Text bg="red.500" p={1}>
      Fishcl le S
    </Text>
  </Flex>
);

export const main = Template.bind({});
main.storyName = 'Default';
main.args = {};

export const withresponsive = Template.bind({});
withresponsive.storyName = 'with responsive direction';
withresponsive.args = {
  direction: ['column', 'row', 'column'],
};

const spaceTemplate = (args: any) => (
  <Flex direction={args.direction} spacing={args.spacing}>
    <Flex direction={args.direction} spacing={args.spacing} bg="red.300" p={2}>
      <Flex justify="center" bg="blue.300">
        Hi
      </Flex>
      <Flex justify="center" bg="blue.600">
        how
      </Flex>
    </Flex>
    <Flex direction={args.direction} spacing={args.spacing} bg="yellow.300" p={2}>
      <Flex justify="center" align="center" bg="blue.300">
        are
      </Flex>
      <Flex justify="center" align="center" bg="blue.600">
        you
      </Flex>
    </Flex>
  </Flex>
);

export const withSpacing = spaceTemplate.bind({});
withSpacing.storyName = 'with spacing';
withSpacing.args = {};
