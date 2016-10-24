import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { closeCreateFusionModal, openCreateFusionModal } from '../../../redux/modules/proposal';
import ProposalFusionForm from '../Form/ProposalFusionForm';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';

const submitProposalFusionForm = () => {};
export const ProposalCreateFusionButton = React.createClass({
  propTypes: {
    showModal: PropTypes.bool.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    open: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { showModal, isSubmitting, open, close } = this.props;
    return (
      <div>
        <Button
          id="add-proposal-fusion"
          bsStyle="primary"
          onClick={() => open()}
        >
          <i className="cap cap-add-1"></i>
          { ` ${this.getIntlMessage('proposal.add')}`}
        </Button>
        <Modal
          animation={false}
          show={showModal}
          onHide={() => close()}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              { this.getIntlMessage('proposal.add') }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h3>Propositions à fusionner</h3>
            <ProposalFusionForm />
            <h3>Nouvelle proposition issue de la fusion</h3>
          </Modal.Body>
          <Modal.Footer>
            <CloseButton
              onClose={() => close()}
            />
            <SubmitButton
              id="confirm-proposal-create"
              isSubmitting={isSubmitting}
              onSubmit={() => submitProposalFusionForm()}
            />
          </Modal.Footer>
        </Modal>
      </div>
    );
  },

});

const mapStateToProps = state => ({
  showModal: state.proposal.isCreatingFusion,
  isSubmitting: false,
});

export default connect(
  mapStateToProps,
  { close: closeCreateFusionModal, open: openCreateFusionModal }
)(ProposalCreateFusionButton);
