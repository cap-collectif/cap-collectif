// @flow
import * as React from 'react';
import Section, { type SectionProps } from '~ui/BackOffice/Section/Section';
import AppBox from '~ui/Primitives/AppBox';
import Flex from '~ui/Primitives/Layout/Flex';

export default {
  title: 'Cap Collectif/BackOffice/Section',
  component: Section,
  argTypes: {
    children: {
      control: { type: null, required: true },
    },
  },
};

const Template = (args: SectionProps) => (
  <Section {...args}>
    <Flex direction="column">
      <Section.Title>Ceci est un titre</Section.Title>
      <Section.Description>
        Ceci est un peu de contenu: Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        Blanditiis consectetur dolorem eaque illo, modi veniam.
      </Section.Description>
    </Flex>

    <AppBox>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores nam nostrum possimus
      quibusdam tempora voluptatibus.
    </AppBox>
  </Section>
);

export const main = Template.bind({});
main.storyName = 'default';
main.args = {
  direction: 'row',
  spacing: 2,
};
