import * as React from 'react'
import { Box, Text, Flex } from '@cap-collectif/ui'
import styled from 'styled-components'
import type { StyledComponent } from 'styled-components'
import CategoryBackground from '~/components/Ui/Medias/CategoryBackground'
import Image from '~ui/Primitives/Image'
type Props = {
  readonly category: {
    readonly id: string
    readonly name: string
    readonly color: string
    readonly categoryImage:
      | {
          readonly image:
            | {
                readonly url: string
              }
            | null
            | undefined
        }
      | null
      | undefined
  }
  readonly stepUrl: string
}
const Link: StyledComponent<any, {}, HTMLAnchorElement> = styled('a')`
  color: inherit;
  text-decoration: none !important;
  &:hover {
    color: inherit;
  }
`

const ProposalCategorySuggestionCard = ({ category, stepUrl }: Props) => {
  const url = new URL(stepUrl)
  url.searchParams.append('category', category.id)
  const image = category.categoryImage?.image
  return (
    <Link href={url} target="_blank" rel="noreferrer">
      <Flex
        bg="neutral-gray.50"
        color="neutral-gray.900"
        mr={4}
        flexShrink={0}
        direction="column"
        justifyContent="space-between"
        width="212px"
        height="190px"
        borderRadius="4px"
        border="normal"
        borderColor="gray.200"
      >
        {image?.url ? (
          <Image src={image.url} alt="" css="object-fit: cover; height: 127px;" />
        ) : (
          <Box flexGrow={1} overflow="hidden" css="border-radius: 4px 4px 0 0">
            <CategoryBackground color={category.color} height="100%" />
          </Box>
        )}
        <Box p={2} bg="white" height="62px" css="border-radius: 0 0 4px 4px" borderTop="normal" borderColor="gray.200">
          <Text
            fontWeight={600}
            fontSize={3}
            overflow="hidden"
            height="100%"
            css="text-overflow: ellipsis; white-space: nowrap;"
          >
            {category.name}
          </Text>
        </Box>
      </Flex>
    </Link>
  )
}

export default ProposalCategorySuggestionCard
