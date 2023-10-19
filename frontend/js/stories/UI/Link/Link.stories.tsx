// @ts-nocheck
import * as React from 'react'
import type { LinkProps } from '~ds/Link/Link'
import Link from '~ds/Link/Link'

export default {
  title: 'Design system/Link',
  component: Link,
  argTypes: {
    href: {
      control: {
        type: 'text',
        required: true,
      },
      description: 'URL to go to',
    },
    variant: {
      control: {
        type: 'radio',
        options: ['primary', 'danger', 'hierarchy'],
        required: false,
        defaultValue: 'primary',
      },
    },
    truncate: {
      control: {
        type: 'number',
        required: false,
      },
      description: 'truncate link',
    },
  },
}

const Template = (args: LinkProps) => <Link {...args}>Click here</Link>

export const main = Template.bind({})
main.storyName = 'Default'
main.args = {
  href: 'https://styled-system.com/',
}
