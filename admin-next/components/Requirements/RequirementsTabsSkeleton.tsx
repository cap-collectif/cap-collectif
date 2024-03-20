import React from 'react'
import { Skeleton, Flex } from '@cap-collectif/ui'

type Props = {}

const RequirementsTabsSkeleton: React.FC<Props> = () => {
  return (
    <Flex direction="column" spacing={4}>
      <Skeleton.Text size="lg" />
      <Skeleton.Text size="lg" />
      <Skeleton.Text size="lg" />
      <Skeleton.Text size="lg" />
      <Skeleton.Text size="lg" />
      <Skeleton.Text size="lg" />
      <Skeleton.Text size="lg" />
      <Skeleton.Text size="lg" />
      <Skeleton.Text size="lg" />
      <Skeleton.Text size="lg" />
    </Flex>
  )
}

export default RequirementsTabsSkeleton
