import React from 'react';
import { Modal, Row } from 'react-bootstrap';
import { IntlMixin, FormattedMessage } from 'react-intl';
import CloseButton from '../Form/CloseButton';
import UserBox from '../User/UserBox';

const AllVotesModal = React.createClass({
  propTypes: {
    votes: React.PropTypes.array.isRequired,
    showModal: React.PropTypes.bool.isRequired,
    onToggleModal: React.PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  close() {
    const { onToggleModal } = this.props;
    onToggleModal(false);
  },

  show() {
    const { onToggleModal } = this.props;
    onToggleModal(true);
  },

  render() {
    const {
      showModal,
      votes,
    } = this.props;
    return (
      <Modal
        animation={false}
        show={showModal}
        onHide={this.close.bind(null, this)}
        bsSize="large"
        aria-labelledby="contained-modal-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            <FormattedMessage
              message={this.getIntlMessage('vote.count')}
              count={votes.length}
            />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            {
              votes.map((vote, index) => {
                return <UserBox key={index} user={vote.user} username={vote.username} />;
              })
            }
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <CloseButton
            onClose={this.close.bind(null, this)}
            label="global.close"
          />
        </Modal.Footer>
      </Modal>
    );
  },

});

export default AllVotesModal;
