import * as React from 'react'
import { Box, Flex, Skeleton } from '@cap-collectif/ui'
import { Card, ImageContainer } from './ProposalPreviewCard'

type Props = {
  showImages?: boolean
}

const CardSkeleton = ({ showImages }: Props) => (
  <Card fullSize={!!showImages}>
    <Flex justify="space-between">
      <Flex direction="column" width="100%" mr={[0, 6]}>
        <Flex mb={2} justify={['space-between', 'start']}>
          <Skeleton.Text height={4} width="10rem" mr={6} />
          <Skeleton.Text height={4} width="5rem" />
        </Flex>
        <Skeleton.Text height={6} width="100%" mb={2} />
        <Skeleton.Text height="7.5rem" width="100%" mb={8} />
        <Flex justifyContent="space-between" alignItems="center" direction={['column-reverse', 'row']}>
          <Flex alignItems="center" display={['none', 'flex']}>
            <Skeleton.Text height={6} width="5.5rem" />
          </Flex>
          <Skeleton.Text height={6} width="12.5rem" />
        </Flex>
      </Flex>
      {showImages ? (
        <ImageContainer>
          <Skeleton.Text height="100%" width="100%" />
        </ImageContainer>
      ) : null}
    </Flex>
  </Card>
)

export const ProposalsListSkeleton = ({ showImages = false }: Props) => (
  <Box
    maxHeight={['100%', '100vh']}
    overflowY="hidden"
    pt={['7rem', 0]}
    pr={[4, 4, 8]}
    pl={[4, 2, 6]}
    id="proposals-list-skeleton"
  >
    <CardSkeleton showImages={showImages} />
    <CardSkeleton showImages={showImages} />
    <CardSkeleton showImages={showImages} />
    <CardSkeleton showImages={showImages} />
  </Box>
)

export default ProposalsListSkeleton
