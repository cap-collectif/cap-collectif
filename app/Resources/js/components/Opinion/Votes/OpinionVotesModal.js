// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Modal, Row } from 'react-bootstrap';
import CloseButton from '../../Form/CloseButton';
// import OpinionActions from '../../../actions/OpinionActions';
import Loader from '../../Ui/Loader';
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
    const moreVotes = opinion.votesCount > 5 ? opinion.votesCount - 5 : null;
    if (!moreVotes) {
      return null;
    }

  const votes = [];
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
              {<FormattedMessage id="opinion.votes.modal.title" />}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Loader show={false}>
              <Row>
                {votes.map((vote, index) => {
                  return (
                    <UserBox
                      key={index}
                      user={vote.user}
                      username={vote.username}
                      className="opinion__votes__userbox"
                    />
                  );
                })}
              </Row>
            </Loader>
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
        votesCount
      }
    }
  `,
});
