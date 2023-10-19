import React, { useState } from 'react'
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { Button, ListGroup, ListGroupItem } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import type { RelayPaginationProp } from 'react-relay'
import { createPaginationContainer, graphql } from 'react-relay'
import type { DebateArgumentListProfile_debateArgumentList } from '~relay/DebateArgumentListProfile_debateArgumentList.graphql'
import useIsMobile from '~/utils/hooks/useIsMobile'
import ModalDeleteArgument from '~/components/Debate/Page/Arguments/ModalDeleteArgument'
import DebateArgumentItem from './DebateArgumentItem'
import Loader from '../Ui/FeedbacksIndicators/Loader'

const ARGUMENTS_PAGINATION = 5
type Props = {
  relay: RelayPaginationProp
  debateArgumentList: DebateArgumentListProfile_debateArgumentList
}
export const DebateArgumentListProfile = ({ debateArgumentList, relay }: Props) => {
  const [loading, setLoading] = useState<boolean>(false)
  const isMobile = useIsMobile()
  const [deleteModalInfo, setDeleteModalInfo] = React.useState<
    | {
        id: string
        type: 'FOR' | 'AGAINST'
        debateUrl: string
        hash?: string | null | undefined
      }
    | null
    | undefined
  >(null)

  const handleLoadMore = () => {
    setLoading(true)
    relay.loadMore(ARGUMENTS_PAGINATION, () => {
      setLoading(false)
    })
  }

  return (
    <>
      <ListGroup bsClass="media-list">
        {debateArgumentList?.debateArguments?.edges
          ?.filter(Boolean)
          .map(edge => edge.node)
          .filter(Boolean)
          .map(debateArgument => (
            <DebateArgumentItem
              key={debateArgument.id}
              debateArgument={debateArgument}
              setDeleteModalInfo={setDeleteModalInfo}
              isMobile={isMobile}
            />
          ))}
        {relay.hasMore() && (
          <ListGroupItem>
            {loading ? (
              <Loader size={28} inline />
            ) : (
              <Button block bsStyle="link" onClick={handleLoadMore}>
                <FormattedMessage id="global.more" />
              </Button>
            )}
          </ListGroupItem>
        )}
      </ListGroup>
      {deleteModalInfo && (
        <ModalDeleteArgument
          debateId={debateArgumentList.id}
          argumentInfo={deleteModalInfo}
          onClose={() => setDeleteModalInfo(null)}
        />
      )}
    </>
  )
}
export default createPaginationContainer(
  DebateArgumentListProfile,
  {
    debateArgumentList: graphql`
      fragment DebateArgumentListProfile_debateArgumentList on User
      @argumentDefinitions(cursor: { type: "String" }, count: { type: "Int!" }, isAuthenticated: { type: "Boolean!" }) {
        id
        debateArguments(first: $count, after: $cursor) @connection(key: "DebateArgumentListProfile_debateArguments") {
          totalCount
          edges {
            node {
              id
              ...DebateArgumentItem_debateArgument @arguments(isAuthenticated: $isAuthenticated)
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
      return props.debateArgumentList && props.debateArgumentList.debateArguments
    },

    getFragmentVariables(prevVars) {
      return { ...prevVars }
    },

    getVariables(props: Props, { count, cursor }, fragmentVariables) {
      return { ...fragmentVariables, count, cursor, userId: props.debateArgumentList.id }
    },

    query: graphql`
      query DebateArgumentListProfileQuery($userId: ID!, $cursor: String, $count: Int!, $isAuthenticated: Boolean!) {
        debateArgumentList: node(id: $userId) {
          id
          ...DebateArgumentListProfile_debateArgumentList
            @arguments(cursor: $cursor, count: $count, isAuthenticated: $isAuthenticated)
        }
      }
    `,
  },
)
