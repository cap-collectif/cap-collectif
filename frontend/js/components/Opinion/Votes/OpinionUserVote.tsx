import React from 'react'
import { graphql, createFragmentContainer } from 'react-relay'
import { Box, Text, Tooltip } from '@cap-collectif/ui'
import UserAvatarDeprecated from '../../User/UserAvatarDeprecated'
import type { OpinionUserVote_vote } from '~relay/OpinionUserVote_vote.graphql'
import { translateContent } from '@shared/utils/contentTranslator'

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
            <UserAvatarDeprecated
              user={vote.author}
              className=""
              style={{
                width: '45px',
              }}
            />
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
        displayName
        media {
          url
        }
      }
    }
  `,
})
