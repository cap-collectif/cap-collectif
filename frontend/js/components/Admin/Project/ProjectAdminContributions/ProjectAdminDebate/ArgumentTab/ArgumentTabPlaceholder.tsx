import * as React from 'react'
import Flex from '~ui/Primitives/Layout/Flex'
import Skeleton from '~ds/Skeleton'

const ArgumentPlaceholder = () => (
  <Flex direction="row" spacing="100px" align="center" p={2} borderTop="normal" borderColor="gray.150">
    <Flex direction="column" spacing={1} flex={1}>
      <Skeleton.Text size="lg" />
      <Skeleton.Text size="sm" width="50%" />
    </Flex>

    <Flex direction="row" flex={1} justify="center">
      <Skeleton.Text size="lg" width={10} />
    </Flex>
  </Flex>
)

const ArgumentTabPlaceholder = () => (
  <Flex direction="column">
    <ArgumentPlaceholder />
    <ArgumentPlaceholder />
    <ArgumentPlaceholder />
    <ArgumentPlaceholder />
    <ArgumentPlaceholder />
  </Flex>
)

export default ArgumentTabPlaceholder
