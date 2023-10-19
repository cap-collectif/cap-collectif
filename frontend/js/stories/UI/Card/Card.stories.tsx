// @ts-nocheck
import * as React from 'react'
import Flex from '~ui/Primitives/Layout/Flex'
import Card from '~ds/Card/Card'
import Text from '~ui/Primitives/Text'

export default {
  title: 'Design system/Card',
  component: Card,
}

const Template = (args: any) => (
  <Flex align="center" gridGap={2}>
    <Card {...args}>
      <Text>Card</Text>
    </Card>
  </Flex>
)

export const main = Template.bind({})
main.storyName = 'Default'
