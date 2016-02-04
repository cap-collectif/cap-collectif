import React from 'react';
import { IntlMixin } from 'react-intl';
import { Modal } from 'react-bootstrap';
import ProposalVoteBox from './ProposalVoteBox';
import CloseButton from '../../Form/CloseButton';
import RegisterButton from '../../Utils/RegisterButton';

const ProposalVoteModal = React.createClass({
  propTypes: {
    proposal: React.PropTypes.object.isRequired,
    selectionStepId: React.PropTypes.number.isRequired,
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
        bsSize="small"
        aria-labelledby="contained-modal-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            { this.getIntlMessage('proposal.vote.modal.title') }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProposalVoteBox
            proposal={this.props.proposal}
            selectionStepId={this.props.selectionStepId}
            onSubmitSuccess={this.close}
          />
        </Modal.Body>
        <Modal.Footer>
          <RegisterButton className="pull-left" />
          <CloseButton className="pull-right" onClose={this.close.bind(null, this)} />
        </Modal.Footer>
      </Modal>
    );
  },

});

export default ProposalVoteModal;
