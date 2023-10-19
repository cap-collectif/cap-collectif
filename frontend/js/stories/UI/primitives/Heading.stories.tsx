// @ts-nocheck
import * as React from 'react'
import Heading from '~ui/Primitives/Heading'

export default {
  title: 'Design system/Primitives/Heading',
  component: Heading,
  argTypes: {},
}

const Template = () => (
  <div>
    <Heading as="h1">Salut</Heading>
    <Heading as="h2">Salut</Heading>
    <Heading as="h3">Salut</Heading>
    <Heading as="h4">Salut</Heading>
    <Heading as="h5">Salut</Heading>
    <Heading as="h6">Salut</Heading>
  </div>
)

export const main = Template.bind({})
main.storyName = 'Default'
main.args = {}
