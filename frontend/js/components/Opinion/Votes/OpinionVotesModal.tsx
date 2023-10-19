import * as React from 'react'
import type { RelayPaginationProp } from 'react-relay'
import { createPaginationContainer, graphql } from 'react-relay'
import { FormattedMessage, useIntl } from 'react-intl'
import { useDisclosure } from '@liinkiing/react-hooks'
import { Button, Modal, Row } from 'react-bootstrap'
import CloseButton from '../../Form/CloseButton'
import UserBox from '../../User/UserBox'
import type { OpinionVotesModal_opinion } from '~relay/OpinionVotesModal_opinion.graphql'
type Props = {
  readonly opinion: OpinionVotesModal_opinion
  readonly relay: RelayPaginationProp
}

const OpinionVotesModal = ({ relay, opinion }: Props) => {
  const intl = useIntl()
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const [loading, setLoading] = React.useState<boolean>(false)
  const moreVotes = opinion.moreVotes && opinion.moreVotes.totalCount > 5 ? opinion.moreVotes.totalCount - 5 : false
  return moreVotes ? (
    <div>
      <Button
        bsStyle="link"
        id="opinion-votes-show-all"
        onClick={onOpen}
        className="opinion__votes__more__link text-center"
      >
        {`+${moreVotes >= 100 ? '99' : moreVotes}`}
      </Button>
      <Modal
        animation={false}
        show={isOpen}
        onHide={onClose}
        bsSize="large"
        className="opinion__votes__more__modal"
        aria-labelledby="opinion-votes-more-title"
      >
        <Modal.Header
          closeButton
          closeLabel={intl.formatMessage({
            id: 'close.modal',
          })}
        >
          <Modal.Title id="opinion-votes-more-title">
            <FormattedMessage id="opinion.votes.modal.title" />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            {opinion &&
              opinion.moreVotes &&
              opinion.moreVotes.edges &&
              opinion.moreVotes.edges
                .filter(Boolean)
                .map(edge => edge.node)
                .filter(Boolean)
                .map(vote => vote.author)
                .filter(Boolean)
                .map((author, index) => <UserBox key={index} user={author} className="opinion__votes__userbox" />)}
          </Row>
          {relay.hasMore() && (
            <Button
              disabled={loading}
              onClick={() => {
                setLoading(true)
                relay.loadMore(100, () => {
                  setLoading(false)
                })
              }}
            >
              <FormattedMessage id="global.more" />
            </Button>
          )}
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={onClose} label="global.close" />
        </Modal.Footer>
      </Modal>
    </div>
  ) : null
}

export default createPaginationContainer(
  OpinionVotesModal,
  {
    opinion: graphql`
      fragment OpinionVotesModal_opinion on Opinion
      @argumentDefinitions(count: { type: "Int", defaultValue: 100 }, cursor: { type: "String" }) {
        id
        moreVotes: votes(first: $count, after: $cursor) @connection(key: "OpinionVotesModal_moreVotes", filters: []) {
          totalCount
          pageInfo {
            hasPreviousPage
            hasNextPage
            startCursor
            endCursor
          }
          edges {
            node {
              author {
                id
                ...UserBox_user
              }
            }
          }
        }
      }
    `,
  },
  {
    direction: 'forward',

    getConnectionFromProps(props: Props) {
      return props.opinion && props.opinion.moreVotes
    },

    getFragmentVariables(prevVars) {
      return { ...prevVars }
    },

    getVariables(props: Props, { count, cursor }, fragmentVariables) {
      return { ...fragmentVariables, count, cursor, opinionId: props.opinion.id }
    },

    query: graphql`
      query OpinionVotesModalPaginatedQuery($opinionId: ID!, $cursor: String, $count: Int) {
        opinion: node(id: $opinionId) {
          ...OpinionVotesModal_opinion @arguments(cursor: $cursor, count: $count)
        }
      }
    `,
  },
)
