// @flow
import * as React from 'react';
import { graphql, createPaginationContainer, type RelayPaginationProp } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Modal, Row, Button } from 'react-bootstrap';
import CloseButton from '../../Form/CloseButton';
import UserBox from '../../User/UserBox';
import type { OpinionVotesModal_opinion } from '~relay/OpinionVotesModal_opinion.graphql';

type Props = {
  opinion: OpinionVotesModal_opinion,
  relay: RelayPaginationProp,
};

type State = {
  showModal: boolean,
  loading: boolean,
};

class OpinionVotesModal extends React.Component<Props, State> {
  state = {
    showModal: false,
    loading: false,
  };

  show = () => {
    this.setState({ showModal: true });
  };

  close = () => {
    this.setState({ showModal: false });
  };

  render() {
    const { relay, opinion } = this.props;
    const moreVotes =
      opinion.moreVotes && opinion.moreVotes.totalCount > 5
        ? opinion.moreVotes.totalCount - 5
        : false;
    if (!moreVotes) {
      return null;
    }

    return (
      <span>
        <Button
          bsStyle="link"
          id="opinion-votes-show-all"
          onClick={this.show}
          className="opinion__votes__more__link text-center">
          {`+${moreVotes >= 100 ? '99' : moreVotes}`}
        </Button>
        <Modal
          animation={false}
          show={this.state.showModal}
          onHide={this.close}
          bsSize="large"
          className="opinion__votes__more__modal"
          aria-labelledby="opinion-votes-more-title">
          <Modal.Header closeButton>
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
                  .map((author, index) => (
                    <UserBox key={index} user={author} className="opinion__votes__userbox" />
                  ))}
            </Row>
            {relay.hasMore() && (
              <Button
                disabled={this.state.loading}
                onClick={() => {
                  this.setState({ loading: true });
                  relay.loadMore(100, () => {
                    this.setState({ loading: false });
                  });
                }}>
                <FormattedMessage id="global.more" />
              </Button>
            )}
          </Modal.Body>
          <Modal.Footer>
            <CloseButton onClose={this.close} label="global.close" />
          </Modal.Footer>
        </Modal>
      </span>
    );
  }
}

export default createPaginationContainer(
  OpinionVotesModal,
  {
    opinion: graphql`
      fragment OpinionVotesModal_opinion on Opinion
        @argumentDefinitions(
          count: { type: "Int", defaultValue: 100 }
          cursor: { type: "String", defaultValue: null }
        ) {
        id
        moreVotes: votes(first: $count, after: $cursor)
          @connection(key: "OpinionVotesModal_moreVotes", filters: []) {
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
    // $FlowFixMe Type of getConnection is not strict
    getConnectionFromProps(props: Props) {
      return props.opinion && props.opinion.moreVotes;
    },
    getFragmentVariables(prevVars) {
      return {
        ...prevVars,
      };
    },
    getVariables(props: Props, { count, cursor }, fragmentVariables) {
      return {
        ...fragmentVariables,
        count,
        cursor,
        opinionId: props.opinion.id,
      };
    },
    query: graphql`
      query OpinionVotesModalPaginatedQuery($opinionId: ID!, $cursor: String, $count: Int) {
        opinion: node(id: $opinionId) {
          ...OpinionVotesModal_opinion @arguments(cursor: $cursor, count: $count)
        }
      }
    `,
  },
);
