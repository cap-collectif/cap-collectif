import { Box, Flex, Skeleton } from '@cap-collectif/ui'
import * as React from 'react'
import { pxToRem } from '@shared/utils/pxToRem'
import ProjectsListPlaceholder from '@shared/projectCard/ProjectsListSkeleton'

export const VoteStepWebLayoutSkeleton: React.FC<{ hasMapView: boolean }> = ({ hasMapView }) => (
  <Box backgroundColor="neutral-gray.50">
    <Box maxWidth={pxToRem(1280)} width="100%" margin="auto" py={8} px={[4, 6]}>
      <Skeleton.Text width="100%" height={pxToRem(100)} mb="xl" />
      <Skeleton.Text width="100%" height={pxToRem(40)} mb="xl" py="lg" />
      <Box>
        <Flex justifyContent="space-between" gap="lg">
          <Box flex="2 1 0">
            <ProjectsListPlaceholder count={10} templateColumns="repeat(2, 1fr)" />
          </Box>
          {hasMapView ? <Skeleton.Text width="100%" height="100vh" flex="1 1 0" /> : null}
        </Flex>
      </Box>
    </Box>
  </Box>
)

export default VoteStepWebLayoutSkeleton
