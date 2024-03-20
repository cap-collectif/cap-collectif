import { Meta, Story } from '@storybook/react'
import { CountSection, CountSectionProps } from './'
import { Flex } from '@cap-collectif/ui'

const meta: Meta = {
  title: 'Admin-next/CountSection',
  component: CountSection,
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

export const Default: Story<CountSectionProps> = () => (
  <CountSection>
    <Flex direction="column">
      <CountSection.Title>Ceci est un titre</CountSection.Title>
      <CountSection.Count>10000</CountSection.Count>
    </Flex>
  </CountSection>
)

export const White: Story<CountSectionProps> = () => (
  <CountSection variant="white">
    <Flex direction="column">
      <CountSection.Title>Ceci est un titre</CountSection.Title>
      <CountSection.Count>10000</CountSection.Count>
    </Flex>
  </CountSection>
)

export const Red: Story<CountSectionProps> = () => (
  <CountSection variant="red">
    <Flex direction="column">
      <CountSection.Title>Ceci est un titre</CountSection.Title>
      <CountSection.Count>10000</CountSection.Count>
    </Flex>
  </CountSection>
)
