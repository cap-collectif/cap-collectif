import * as React from 'react'
import { FormattedMessage, FormattedDate } from 'react-intl'
import moment from 'moment'
import { graphql, createFragmentContainer } from 'react-relay'
import type { DebateVoteItem_vote$data } from '~relay/DebateVoteItem_vote.graphql'
import colors from '~/styles/modules/colors'
import { Box, Flex, Link, Tag, Text } from '@cap-collectif/ui'

type Props = {
  vote: DebateVoteItem_vote$data
}
export const DebateVoteItem = ({ vote }: Props) => (
  <Box as="li" p={6} borderRadius={6} border="card" borderColor="gray.200" mb={6} bg="white">
    <Link
      href={vote.debate.url}
      fontSize={18}
      fontWeight={600}
      css={{
        textDecoration: 'none',
        color: colors.gray[900],
        '&:hover': {
          textDecoration: 'none',
          color: colors.blue[500],
        },
      }}
    >
      {vote.debate.step.title}
    </Link>
    <Flex flexDirection="row" spacing={2} alignItems="center">
      <Text fontSize={14} fontWeight={600} color="gray.900" as="div">
        <FormattedMessage id="i-voted" />
      </Text>
      <Tag variantColor={vote.type === 'FOR' ? 'success' : 'danger'}>
        <FormattedMessage
          id={vote.type === 'FOR' ? 'argument.show.type.for' : 'argument.show.type.against'}
        />
      </Tag>
      <Text
        as="div"
        fontSize={14}
        color="gray.700"
        css={{
          textTransform: 'lowercase',
        }}
      >
        <FormattedMessage
          id="global.dates.full_day"
          values={{
            date: <FormattedDate value={moment(vote.publishedAt)} day="numeric" month="short" year="numeric" />,
            time: <FormattedDate value={moment(vote.publishedAt)} hour="numeric" minute="numeric" />,
          }}
        />
      </Text>
    </Flex>
  </Box>
)
export default createFragmentContainer(DebateVoteItem, {
  vote: graphql`
    fragment DebateVoteItem_vote on DebateVote {
      id
      publishedAt
      type
      debate {
        id
        url
        step {
          id
          title
        }
      }
    }
  `,
})
