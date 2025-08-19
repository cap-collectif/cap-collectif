import * as React from 'react'
import { Flex, Skeleton } from '@cap-collectif/ui'
import { pxToRem } from '@shared/utils/pxToRem'

export const ProjectHeaderStatsPlaceholder = () => (
  <Flex
    flexDirection="row"
    flexWrap="wrap"
    width="100%"
    flexBasis="100%"
    alignItems="flex-end"
    justifyContent="flex-start"
    gap={['md', 'lg']}
  >
    <Flex direction="column" justify="flex-start" alignItems="start" gap={2}>
      <Skeleton.Text width={pxToRem(40)} height={5} />
      <Skeleton.Text width={pxToRem(100)} height={5} />
    </Flex>
    <Flex direction="column" justify="flex-start" alignItems="start" gap={2}>
      <Skeleton.Text width={pxToRem(40)} height={5} />
      <Skeleton.Text width={pxToRem(100)} height={5} />
    </Flex>
    <Flex direction="column" justify="flex-start" alignItems="start" gap={2}>
      <Skeleton.Text width={pxToRem(40)} height={5} />
      <Skeleton.Text width={pxToRem(100)} height={5} />
    </Flex>
  </Flex>
)

export default ProjectHeaderStatsPlaceholder
