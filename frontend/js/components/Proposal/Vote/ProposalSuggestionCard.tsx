import * as React from 'react'
import { Box, Text, Avatar, Flex, CapUIFontSize } from '@cap-collectif/ui'
import styled from 'styled-components'

import WYSIWYGRender from '@shared/form/WYSIWYGRender'
type Props = {
  readonly proposal: {
    readonly id: string
    readonly title: string
    readonly body: string | null | undefined
    readonly summary: string | null | undefined
    readonly url: string
    readonly author: {
      readonly username: string | null | undefined
    }
  }
}
// enables vertical text-ellipsis https://stackoverflow.com/a/46111494
const Body = styled(Box)`
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`
const Link = styled('a')`
  color: inherit;
  text-decoration: none !important;
  &:hover {
    color: inherit;
  }
`

const ProposalSuggestionCard = ({ proposal }: Props) => {
  if (!proposal) return null
  const authorInitial = proposal.author?.username?.charAt(0)?.toUpperCase()
  const body = proposal.summary ? proposal.summary : proposal.body
  return (
    <Link href={proposal.url} target="_blank" rel="noreferrer">
      <Flex
        bg="neutral-gray.50"
        color="neutral-gray.900"
        p={4}
        mr={4}
        flexShrink={0}
        direction="column"
        justifyContent="space-between"
        width="266px"
        height="180px"
      >
        <Box mb={2}>
          <Text fontWeight={600} fontSize={CapUIFontSize.BodyRegular} mb={2}>
            {proposal.title}
          </Text>
        </Box>
        <Body>
          <WYSIWYGRender value={body} />
        </Body>
        <Flex align="center" mt={2}>
          <Avatar name={authorInitial} mr={2}>
            {authorInitial}
          </Avatar>
          <Text fontSize={CapUIFontSize.BodyRegular}>{proposal.author.username}</Text>
        </Flex>
      </Flex>
    </Link>
  )
}

export default ProposalSuggestionCard
