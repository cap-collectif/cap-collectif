// @ts-nocheck
import * as React from 'react'
import type { SkeletonProps } from '~ds/Skeleton'
import Skeleton from '~ds/Skeleton'
import Flex from '~ui/Primitives/Layout/Flex'

export default {
  title: 'Design system/Skeleton',
  component: Skeleton,
  argTypes: {
    isLoaded: {
      control: {
        type: 'boolean',
        required: true,
      },
      description: 'condition which render children',
      defaultValue: 'false',
    },
    placeholder: {
      control: {
        type: null,
        required: true,
      },
      description: 'rendered when is loading',
    },
    children: {
      control: {
        type: null,
        required: true,
      },
      description: 'rendered when loaded',
    },
    animate: {
      control: {
        type: 'boolean',
      },
      description: 'animate placeholder',
      defaultValue: 'true',
    },
  },
}

const Template = ({ isLoaded, animate, placeholder }: SkeletonProps) => (
  <Skeleton isLoaded={isLoaded} placeholder={placeholder} animate={animate}>
    Hi, I am the childd
  </Skeleton>
)

export const main = Template.bind({})
main.storyName = 'Default'
main.args = {
  isLoaded: false,
  placeholder: (
    <Flex direction="row" spacing={4}>
      <Skeleton.Circle size={10} />

      <Flex direction="column" spacing={2} flex={1}>
        <Skeleton.Text size="lg" />
        <Skeleton.Text size="md" />
        <Skeleton.Text size="sm" />
      </Flex>
    </Flex>
  ),
}
