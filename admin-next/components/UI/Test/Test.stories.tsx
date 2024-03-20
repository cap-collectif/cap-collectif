import { Meta, Story } from '@storybook/react'
import { Test, TestProps } from './Test'

const meta: Meta = {
  title: 'Admin-next/Test',
  component: Test,
  parameters: {
    controls: { expanded: true },
  },
}

export default meta

export const Default: Story<TestProps> = args => <Test {...args} text="coucou" />
