// @flow
import * as React from 'react';
import Text from '~ui/Primitives/Text';
import Grid from '~ui/Primitives/Layout/Grid';
import Flex from '~ui/Primitives/Layout/Flex';

export default {
  title: 'Design system/Primitives/Text',
  component: Text,
  argTypes: {},
};
const Template = (args: any) => (
  <Grid gridGap={2} autoFit={{ min: '300px', max: '1fr' }}>
    <Text bg="red.300" {...args}>
      I have a text, I have an Apple, hmmm, Apple Text
    </Text>
    <Text fontSize={4} bg="red.300" color="blue.800" p={2} {...args}>
      I have a bigger text, I have an Apple (and also a bigger padding), hmmm, Apple Text
    </Text>
  </Grid>
);

export const main = Template.bind({});
main.storyName = 'Default';
main.args = {};

const TruncateTemplate = (args: any) => (
  <Flex>
    <Text p={2} bg="red.300" truncate={args.truncate}>
      Je suis tronqué tu vois que mes {args.truncate} premiers charactères, mais si tu me survol tu
      verras mon contenu complet
    </Text>
  </Flex>
);

export const Truncate = TruncateTemplate.bind({});
Truncate.args = { truncate: 42 };
