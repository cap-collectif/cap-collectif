// @flow
import React from 'react';
import { Modal, Row } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import CloseButton from '../Form/CloseButton';
import UserBox from '../User/UserBox';

type Props = {
  votes: Array<$FlowFixMe>,
  showModal: boolean,
  onToggleModal: Function,
};

export class AllVotesModal extends React.Component<Props> {
  close = () => {
    const { onToggleModal } = this.props;
    onToggleModal(false);
  };

  render() {
    const { showModal, votes } = this.props;
    return (
      <Modal
        animation={false}
        show={showModal}
        onHide={this.close}
        bsSize="large"
        aria-labelledby="contained-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            <FormattedMessage
              id="vote.count"
              values={{
                count: votes.length,
              }}
            />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            {votes.map((vote, key) => (
              <UserBox key={key} user={vote.user} username={vote.username} />
            ))}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={this.close} label="global.close" />
        </Modal.Footer>
      </Modal>
    );
  }
}

export default AllVotesModal;
