// @ts-nocheck
import * as React from 'react'
import Accordion from '~ds/Accordion'
import AppBox from '~ui/Primitives/AppBox'
import Text from '~ui/Primitives/Text'

export default {
  title: 'Design system/Accordion',
  component: Accordion,
  argTypes: {
    defaultAccordion: {
      control: {
        type: 'text',
      },
      description: 'Accordion open by default',
    },
    allowMultiple: {
      control: {
        type: 'boolean',
      },
      description: 'Allow to open multiple accordion at the same time',
      defaultValue: 'false',
    },
  },
}

const Template = (args: any) => (
  <AppBox bg="gray.500" p="40px">
    <Accordion spacing={2} defaultAccordion={args.defaultAccordion} allowMultiple={args.allowMultiple}>
      <Accordion.Item id="volet-1">
        <Accordion.Button>
          <Text color="blue.900" fontSize={4}>
            Volet 1
          </Text>
        </Accordion.Button>
        <Accordion.Panel>
          <Text color="gray.500" fontSize={3}>
            Contenu du volet 1
          </Text>
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item id="volet-2">
        <Accordion.Button>
          <Text color="blue.900" fontSize={4}>
            Volet 2
          </Text>
        </Accordion.Button>
        <Accordion.Panel>
          <Text color="gray.500" fontSize={3}>
            Contenu du volet 2
          </Text>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  </AppBox>
)

export const main = Template.bind({})
main.storyName = 'Default'
main.args = {}
export const withDefaultOpen = Template.bind({})
withDefaultOpen.args = {
  defaultAccordion: 'volet-2',
}
export const withMultipleDefaultOpen = Template.bind({})
withMultipleDefaultOpen.args = {
  defaultAccordion: ['volet-1', 'volet-2'],
}
export const withMultipleOpenAllow = Template.bind({})
withMultipleOpenAllow.args = {
  allowMultiple: true,
}
