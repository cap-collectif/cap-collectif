// @ts-nocheck
import * as React from 'react'
import type { Props } from '~ui/Uploader/Uploader'
import Uploader, { UPLOADER_SIZE } from '~ui/Uploader/Uploader'

const listUploaderSizes = Object.values(UPLOADER_SIZE)
export default {
  title: 'Design system/Uploader',
  component: Uploader,
  argTypes: {
    size: {
      control: {
        type: 'select',
        options: listUploaderSizes,
      },
    },
    label: {
      control: {
        type: 'text',
      },
    },
  },
  args: {
    label: 'Label',
    format: 'image/*',
    minResolution: {
      width: 170,
      height: 170,
    },
  },
}

const Template = (args: Props) => <Uploader {...args} />

export const main = Template.bind({})
main.storyName = 'Default'
main.args = {
  size: UPLOADER_SIZE.LG,
  maxSize: 10,
  multiple: false,
}
export const multiple = Template.bind({})
multiple.args = {
  size: UPLOADER_SIZE.LG,
  maxSize: 1,
  multiple: true,
}
export const medium = Template.bind({})
medium.args = {
  size: UPLOADER_SIZE.MD,
  maxSize: 10,
  multiple: false,
}
export const small = Template.bind({})
small.args = {
  size: UPLOADER_SIZE.SM,
  maxSize: 10,
  multiple: false,
}
export const Circle = Template.bind({})
Circle.args = {
  size: UPLOADER_SIZE.SM,
  maxSize: 10,
  multiple: false,
  circle: true,
}
export const Disabled = Template.bind({})
Disabled.args = {
  size: UPLOADER_SIZE.LG,
  maxSize: 10,
  multiple: false,
  disabled: true,
}
