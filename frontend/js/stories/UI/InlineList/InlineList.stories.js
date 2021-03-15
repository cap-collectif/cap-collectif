// @flow
import * as React from 'react';
import InlineList from '~ds/InlineList/InlineList';
import Text from '~ui/Primitives/Text';

export default {
  title: 'Design system/InlineList',
  component: InlineList,
  argTypes: {
    separator: { control: { type: 'text' }, description: 'Separator', default: '•' },
    spacing: { control: { type: 'number' }, description: 'spacing' },
  },
};
const Template = (args: any) => (
  <InlineList {...args}>
    <Text>San francisco</Text>
    <Text>California love</Text>
    <Text>Floride</Text>
  </InlineList>
);

export const main = Template.bind({});
main.storyName = 'Default';
main.args = {
  separator: '•',
};
