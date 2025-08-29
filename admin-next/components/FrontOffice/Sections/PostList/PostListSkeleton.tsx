import { Box, Flex, Skeleton } from '@cap-collectif/ui'
import ProjectsListPlaceholder from '@shared/projectCard/ProjectsListSkeleton'
import { pxToRem } from '@shared/utils/pxToRem'

export const OVERFLOW_HEIGHT = 256

export const PostListSkeleton = () => (
  <Box mt={[0, pxToRem(-OVERFLOW_HEIGHT)]}>
    <Flex p="md" borderRadius="normal" bg="white" gap="md" display={['none', 'flex']}>
      <Skeleton.Text width="48%" height={pxToRem(400)} />
      <Flex width="52%" direction="column" justify="space-between">
        <Flex direction="column" gap="md">
          <Skeleton.Text width="100%" height={6} />
          <Skeleton.Text width="100%" height={4} />
          <Skeleton.Text width="100%" height={4} />
        </Flex>
        <Flex gap="md">
          <Skeleton.Text width={pxToRem(100)} height={4} />
          <Skeleton.Text width={pxToRem(100)} height={4} />
        </Flex>
      </Flex>
    </Flex>
    <ProjectsListPlaceholder count={10} />
  </Box>
)
