import React from 'react';
import {Modal, Row} from 'react-bootstrap';
import {IntlMixin, FormattedMessage} from 'react-intl';
import CloseButton from '../../Form/CloseButton';
import UserBox from '../../User/UserBox';

const ProposalAllVotesModal = React.createClass({
  propTypes: {
    votes: React.PropTypes.array.isRequired,
    showModal: React.PropTypes.bool.isRequired,
    onToggleModal: React.PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  close() {
    this.props.onToggleModal(false);
  },

  show() {
    this.props.onToggleModal(true);
  },

  render() {
    return (
      <Modal
        animation={false}
        show={this.props.showModal}
        onHide={this.close.bind(null, this)}
        bsSize="large"
        aria-labelledby="contained-modal-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            <FormattedMessage
              message={this.getIntlMessage('proposal.vote.count')}
              num={this.props.votes.length}
            />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            {
              this.props.votes.map((vote, index) => {
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

export default ProposalAllVotesModal;
