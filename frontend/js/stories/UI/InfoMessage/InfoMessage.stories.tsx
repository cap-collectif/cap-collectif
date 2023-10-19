// @ts-nocheck
import * as React from 'react'
import type { InfoMessageProps } from '~ds/InfoMessage/InfoMessage'
import InfoMessage from '~ds/InfoMessage/InfoMessage'

export default {
  title: 'Design system/InfoMessage',
  component: InfoMessage,
  argTypes: {
    variant: {
      control: {
        type: 'select',
        options: ['info', 'infoGray', 'danger', 'success', 'warning'],
        required: true,
      },
      description: 'Type of variant',
      defaultValue: 'info',
    },
    children: {
      control: {
        type: null,
        required: true,
      },
    },
  },
}

const Template = (args: InfoMessageProps) => (
  <InfoMessage {...args}>
    <InfoMessage.Title>Ceci est un titre</InfoMessage.Title>
    <InfoMessage.Content>Ceci est du contenu</InfoMessage.Content>
  </InfoMessage>
)

export const main = Template.bind({})
main.storyName = 'Default'
main.args = {}

const TemplateWithIcon = (args: InfoMessageProps) => (
  <InfoMessage {...args}>
    <InfoMessage.Title withIcon>Ceci est un titre</InfoMessage.Title>
  </InfoMessage>
)

export const withIcon = TemplateWithIcon.bind({})
withIcon.storyName = 'with title icon'
withIcon.args = {}
