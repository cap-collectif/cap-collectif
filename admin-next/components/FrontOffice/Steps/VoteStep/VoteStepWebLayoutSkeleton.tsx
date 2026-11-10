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
          <Box id="proposals-list-skeleton" flex="2 1 0">
            <ProjectsListPlaceholder count={10} templateColumns="repeat(2, 1fr)" />
          </Box>
          {hasMapView ? <Skeleton.Text id="map-skeleton" width="100%" height="100vh" flex="1 1 0" /> : null}
        </Flex>
      </Box>
    </Box>
  </Box>
)

export const VoteStepProjectHeroSkeleton: React.FC = () => (
  <Box backgroundColor="white" borderBottom="1px solid #e3e3e3">
    <Box maxWidth={pxToRem(1280)} width="100%" margin="auto" py={9} px={[4, 6]}>
      <Flex gap="lg" flexDirection={['column-reverse', 'row']}>
        <Box flex="1">
          <Skeleton.Text width="35%" height={pxToRem(24)} mb="md" />
          <Skeleton.Text width="80%" height={pxToRem(50)} mb="lg" />
          <Skeleton.Text width="60%" height={pxToRem(24)} />
        </Box>
        <Skeleton.Text width={['100%', pxToRem(405)]} height={pxToRem(270)} />
      </Flex>
    </Box>
  </Box>
)

export default VoteStepWebLayoutSkeleton
