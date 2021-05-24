// @flow
import * as React from 'react';
import Label, { type LabelProps } from '~ui/Dashboard/Label';

export default {
  title: 'Cap Collectif/Dashboard/Label',
  component: Label,
  argTypes: {
    circleColor: {
      control: {
        type: 'text',
        required: true,
      },
      description: 'color of circle',
    },
    children: {
      control: { type: null, required: true },
    },
  },
};

const Template = (args: LabelProps) => <Label {...args}>{args.children}</Label>;

export const main = Template.bind({});
main.storyName = 'default';
main.args = {
  children: 'Ceci est du contenu',
  circleColor: 'blue.500',
};
