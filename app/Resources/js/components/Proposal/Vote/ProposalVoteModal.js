import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { Modal } from 'react-bootstrap';
import ProposalVoteBox from './ProposalVoteBox';
import CloseButton from '../../Form/CloseButton';

const ProposalVoteModal = React.createClass({
  displayName: 'ProposalVoteModal',
  propTypes: {
    proposal: PropTypes.object.isRequired,
    selectionStep: PropTypes.object.isRequired,
    showModal: PropTypes.bool.isRequired,
    onToggleModal: PropTypes.func.isRequired,
    userHasVote: PropTypes.bool,
    creditsLeft: PropTypes.number,
    onVoteChange: PropTypes.func,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      userHasVote: false,
      creditsLeft: null,
      onVoteChange: () => {},
    };
  },

  onSubmitSuccess() {
    this.close();
    this.props.onVoteChange();
  },

  close() {
    this.props.onToggleModal(false);
  },

  show() {
    this.props.onToggleModal(true);
  },

  render() {
    const { showModal, proposal, selectionStep, userHasVote, creditsLeft } = this.props;
    return (
      <Modal
        animation={false}
        show={showModal}
        onHide={this.close}
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
            proposal={proposal}
            selectionStep={selectionStep}
            onSubmitSuccess={this.onSubmitSuccess}
            userHasVote={userHasVote}
            creditsLeft={creditsLeft}
          />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton className="pull-right" onClose={this.close} />
        </Modal.Footer>
      </Modal>
    );
  },

});

export default ProposalVoteModal;
