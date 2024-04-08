import React, { useState } from 'react'
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { ListGroup, ListGroupItem, Button } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import type { RelayPaginationProp } from 'react-relay'
import { graphql, createPaginationContainer } from 'react-relay'
import type { DebateVoteListProfile_debateVoteList$data } from '~relay/DebateVoteListProfile_debateVoteList.graphql'
import DebateVoteItem from './DebateVoteItem'
import Loader from '../Ui/FeedbacksIndicators/Loader'

const DEBATE_VOTE_PAGINATION = 5
type Props = {
  relay: RelayPaginationProp
  debateVoteList: DebateVoteListProfile_debateVoteList$data
}
export const DebateVoteListProfile = ({ debateVoteList, relay }: Props) => {
  const [loading, setLoading] = useState<boolean>(false)

  const handleLoadMore = () => {
    setLoading(true)
    relay.loadMore(DEBATE_VOTE_PAGINATION, () => {
      setLoading(false)
    })
  }

  if (debateVoteList.debateVotes.totalCount === 0) {
    return null
  }

  return (
    <ListGroup bsClass="media-list" componentClass="ul">
      {debateVoteList.debateVotes.edges
        ?.filter(Boolean)
        .map(edge => edge.node)
        .filter(Boolean)
        .map(vote => (
          // @ts-ignore old relay types
          <DebateVoteItem vote={vote} key={vote.id} />
        ))}
      {relay.hasMore() && (
        <ListGroupItem
          style={{
            textAlign: 'center',
          }}
        >
          {loading ? (
            <Loader />
          ) : (
            <Button bsStyle="link" onClick={handleLoadMore}>
              <FormattedMessage id="global.more" />
            </Button>
          )}
        </ListGroupItem>
      )}
    </ListGroup>
  )
}
export default createPaginationContainer(
  DebateVoteListProfile,
  {
    debateVoteList: graphql`
      fragment DebateVoteListProfile_debateVoteList on User
      @argumentDefinitions(count: { type: "Int!" }, cursor: { type: "String" }) {
        id
        debateVotes(first: $count, after: $cursor) @connection(key: "VoteListProfile_debateVotes") {
          totalCount
          edges {
            node {
              id
              ...DebateVoteItem_vote
            }
          }
          pageInfo {
            hasPreviousPage
            hasNextPage
            startCursor
            endCursor
          }
        }
      }
    `,
  },
  {
    direction: 'forward',

    getConnectionFromProps(props: Props) {
      return props.debateVoteList && props.debateVoteList.debateVotes
    },

    getFragmentVariables(prevVars) {
      return { ...prevVars }
    },

    getVariables(props: Props, { count, cursor }, fragmentVariables) {
      return { ...fragmentVariables, count, cursor, userId: props.debateVoteList.id }
    },

    query: graphql`
      query DebateVoteListProfileQuery($userId: ID!, $cursor: String, $count: Int!) {
        debateVoteList: node(id: $userId) {
          id
          ...DebateVoteListProfile_debateVoteList @arguments(cursor: $cursor, count: $count)
        }
      }
    `,
  },
)
