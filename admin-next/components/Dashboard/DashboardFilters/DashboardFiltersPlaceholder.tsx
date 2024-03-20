import type { FC } from 'react'
import { Flex, Skeleton } from '@cap-collectif/ui'

const DashboardFiltersPlaceholder: FC = () => (
  <Flex direction="row" align="center" spacing={2}>
    <Skeleton.Text width="200px" size="lg" bg="white" />
    <Skeleton.Text width="215px" size="lg" bg="white" />
    <Skeleton.Text width="215px" size="lg" bg="white" />
  </Flex>
)

export default DashboardFiltersPlaceholder
