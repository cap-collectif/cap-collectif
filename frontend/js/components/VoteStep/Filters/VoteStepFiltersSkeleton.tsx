import * as React from 'react'
import { Box, Flex, Skeleton } from '@cap-collectif/ui'

type Props = {
  isMobile: boolean
}

const FiltersSkeleton = () => {
  return (
    <Flex direction="column" spacing={4}>
      <Skeleton.Text height={7} width="15rem" maxWidth="100%" />
      <Skeleton.Text height={7} width="15rem" maxWidth="100%" />
      <Skeleton.Text height={7} width="15rem" maxWidth="100%" />
      <Skeleton.Text height={7} width="15rem" maxWidth="100%" />
      <Skeleton.Text height={7} width="15rem" maxWidth="100%" />
    </Flex>
  )
}

export const VoteStepFiltersSkeleton = ({ isMobile }: Props) => {
  if (isMobile) {
    return (
      <Box
        bg="#FDFBF7"
        height="100%"
        minHeight="100vh"
        py={10}
        px={4}
        position="fixed"
        width="100%"
        zIndex={1030}
        top={0}
      >
        <Flex justifyContent="space-between" mb={6}>
          <Skeleton.Text height={8} width="10rem" />
          <Skeleton.Text height={8} width="3rem" />
        </Flex>
        <FiltersSkeleton />
      </Box>
    )
  }

  return (
    <Box width="100%" minHeight="100vh" height="100%" p={8} color="neutral-gray.900">
      <Skeleton.Text height={8} width="10rem" mr={6} mb={6} />
      <FiltersSkeleton />
    </Box>
  )
}
export default VoteStepFiltersSkeleton
