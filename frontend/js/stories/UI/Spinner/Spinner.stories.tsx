// @ts-nocheck
import * as React from 'react'
import Spinner from '~ds/Spinner/Spinner'
import Flex from '~ui/Primitives/Layout/Flex'
import { ICON_SIZE } from '~ds/Icon/Icon'
const sizes = Object.entries(ICON_SIZE).map(([, value]) => value)
export default {
  title: 'Design system/Spinner',
  component: Spinner,
  argTypes: {},
}

const Template = (args: any) => (
  <Flex align="center" gridGap={2} wrap="wrap" {...args}>
    {sizes.map((size, i) => (
      <Spinner size={size as any as string} key={i} />
    ))}
  </Flex>
)

export const main = Template.bind({})
main.storyName = 'Default'
main.args = {}

const ContainerTemplate = (args: any) => (
  <Flex
    width={100}
    height={100}
    align="center"
    justify="center"
    borderRadius="card"
    borderStyle="solid"
    borderColor="gray.150"
    bg="gray.100"
    borderWidth="1px"
  >
    <Spinner {...args} />
  </Flex>
)

export const Container = ContainerTemplate.bind({})
Container.storyName = 'within a container'
Container.args = {
  size: 'xl',
}

const ColorTemplate = (args: any) => <Spinner {...args} />

export const withColor = ColorTemplate.bind({})
withColor.storyName = 'with color'
withColor.args = {
  size: 'xl',
  color: 'gray.500',
}
