import * as React from 'react'
import { Flex, AbstractCard, Skeleton, Box } from '@cap-collectif/ui'

const DebateArticleCard = (): JSX.Element => (
  <AbstractCard bg="white" p={0} flexDirection="column" overflow="hidden" display="flex" flex={1}>
    <Box width="100%" bg="gray.150" height="135px" />

    <Flex direction="column" p={4} bg="white" flex={1}>
      <Skeleton.Text height="35px" width="100%" />
      <Skeleton.Text size="sm" width="50%" my={2} />
      <Skeleton.Text size="sm" width="50%" />
    </Flex>
  </AbstractCard>
)

export default DebateArticleCard
