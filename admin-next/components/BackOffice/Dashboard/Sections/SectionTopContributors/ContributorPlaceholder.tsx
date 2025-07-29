import type { FC } from 'react'
import { Flex, Skeleton } from '@cap-collectif/ui'

const ContributorPlaceholder: FC = () => (
  <Flex direction="column" align="center" spacing={2}>
    <Skeleton.Circle size="58px" />
    <Skeleton.Text width="100px" height="60px" />
  </Flex>
)

export default ContributorPlaceholder
