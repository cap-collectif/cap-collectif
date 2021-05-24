// @flow
import * as React from 'react';
import Section, { type SectionProps } from '~ui/Dashboard/Section';

export default {
  title: 'Cap Collectif/Dashboard/Section',
  component: Section,
  argTypes: {
    label: {
      control: {
        type: 'text',
        required: true,
      },
      description: 'title of section',
    },
    children: {
      control: { type: null, required: true },
    },
  },
};

const Template = (args: SectionProps) => <Section {...args}>{args.children}</Section>;

export const main = Template.bind({});
main.storyName = 'default';
main.args = {
  label: 'Ceci est un titre',
  children: <p>Ceci est du contenu</p>,
};
