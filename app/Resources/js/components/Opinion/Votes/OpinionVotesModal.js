// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Modal, Row } from 'react-bootstrap';
import CloseButton from '../../Form/CloseButton';
// import Loader from '../Ui/Loader';
import UserBox from '../../User/UserBox';
import type { OpinionVotesModal_opinion } from './__generated__/OpinionVotesModal_opinion.graphql';

type Props = {
  opinion: OpinionVotesModal_opinion,
};

type State = {
  showModal: boolean,
};

class OpinionVotesModal extends React.Component<Props, State> {
  state = {
    showModal: false,
  };

  show = () => {
    this.setState({ showModal: true });
  };

  close = () => {
    this.setState({ showModal: false });
  };

  render() {
    const { opinion } = this.props;
    const moreVotes =
      opinion.moreVotes && opinion.moreVotes.totalCount > 5
        ? opinion.moreVotes.totalCount - 5
        : false;
    if (!moreVotes) {
      return null;
    }

    return (
      <span>
        <span
          id="opinion-votes-show-all"
          onClick={this.show}
          className="opinion__votes__more__link text-center">
          {`+${moreVotes}`}
        </span>
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
                  .map((author, index) => {
                    /* $FlowFixMe */
                    return (
                      <UserBox key={index} user={author} className="opinion__votes__userbox" />
                    );
                  })}
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <CloseButton onClose={this.close} label="global.close" />
          </Modal.Footer>
        </Modal>
      </span>
    );
  }
}

export default createFragmentContainer(OpinionVotesModal, {
  opinion: graphql`
    fragment OpinionVotesModal_opinion on OpinionOrVersion {
      ... on Opinion {
        id
        moreVotes: votes(first: 100) {
          totalCount
          edges {
            node {
              author {
                id
                show_url
                displayName
                username
                contributionsCount
                media {
                  url
                }
              }
            }
          }
        }
      }
    }
  `,
});
