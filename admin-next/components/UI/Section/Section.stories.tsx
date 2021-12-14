import { Meta, Story } from '@storybook/react';
import { Section, SectionProps } from './';
import { Flex, Box } from '@cap-collectif/ui';

const meta: Meta = {
    title: 'Admin-next/Section',
    component: Section,
    parameters: {
        controls: { expanded: true },
    },
};

export default meta;

export const Default: Story<SectionProps> = args => (
    <Section>
        <Flex direction="column">
            <Section.Title>Ceci est un titre</Section.Title>
            <Section.Description>
                Ceci est un peu de contenu: Lorem ipsum dolor sit amet, consectetur adipisicing
                elit. Blanditiis consectetur dolorem eaque illo, modi veniam.
            </Section.Description>
        </Flex>

        <Box>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores nam nostrum
            possimus quibusdam tempora voluptatibus.
        </Box>
    </Section>
);

export const WithoutDescription: Story<SectionProps> = args => (
    <Section>
        <Section.Title>Ceci est un titre</Section.Title>

        <Box>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Asperiores nam nostrum
            possimus quibusdam tempora voluptatibus.
        </Box>
    </Section>
);
