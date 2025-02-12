import React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'
import { Box, Text, Tooltip } from '@cap-collectif/ui'
import type { OpinionUserVote_vote } from '~relay/OpinionUserVote_vote.graphql'
import { translateContent } from '@shared/utils/contentTranslator'
import UserAvatar from '~/components/User/UserAvatar'

type Props = {
  vote: OpinionUserVote_vote
  className?: string
}

class OpinionUserVote extends React.Component<Props> {
  render() {
    const { vote, className } = this.props
    if (!vote.author) return null
    return (
      <span className={className}>
        <Tooltip
          placement="top"
          label={
            <Text fontSize={1} marginBottom={0}>
              {translateContent(vote.author.displayName)}
            </Text>
          }
          id={`opinion-vote-tooltip-${vote.id}`}
          className="text-left"
          style={{
            wordBreak: 'break-word',
          }}
        >
          <Box width="45px">
            <UserAvatar user={vote.author} className="" />
          </Box>
        </Tooltip>
      </span>
    )
  }
}

export default createFragmentContainer(OpinionUserVote, {
  vote: graphql`
    fragment OpinionUserVote_vote on YesNoPairedVote {
      id
      author {
        ...UserAvatar_user
        displayName
      }
    }
  `,
})
