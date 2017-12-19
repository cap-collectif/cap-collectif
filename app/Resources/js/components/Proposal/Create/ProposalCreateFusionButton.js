// @flow
import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import {
  closeCreateFusionModal,
  openCreateFusionModal,
  submitFusionForm,
} from '../../../redux/modules/proposal';
import ProposalFusionForm, { formName } from '../Form/ProposalFusionForm';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import type { State, Uuid } from '../../../types';

export const ProposalCreateFusionButton = React.createClass({
  propTypes: {
    showModal: PropTypes.bool.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    open: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    proposalFormId: PropTypes.string,
  },

  render() {
    const { proposalFormId, showModal, isSubmitting, open, close, submit } = this.props;
    return (
      <div>
        <Button
          id="add-proposal-fusion"
          bsStyle="default"
          style={{ marginTop: 10 }}
          onClick={() => open()}>
          <FormattedMessage id="proposal.add_fusion" />
        </Button>
        <Modal
          animation={false}
          show={showModal}
          onHide={() => close()}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg">
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              <FormattedMessage id="proposal.add_fusion" />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h3>Propositions fusionnées</h3>
            <ProposalFusionForm />
          </Modal.Body>
          <Modal.Footer>
            <CloseButton onClose={() => close()} />
            <SubmitButton
              id="confirm-proposal-merge-create"
              isSubmitting={isSubmitting}
              onSubmit={() => submit(proposalFormId)}
            />
          </Modal.Footer>
        </Modal>
      </div>
    );
  },
});

const mapStateToProps = (state: State) => {
  const selectedProjectId: Uuid = formValueSelector(formName)(state, 'project');
  const project = state.project.projectsById[selectedProjectId];
  const currentCollectStep = project ? project.steps.filter(s => s.type === 'collect')[0] : null;
  return {
    showModal: state.proposal.isCreatingFusion,
    isSubmitting: state.proposal.isSubmittingFusion,
    proposalFormId: currentCollectStep ? currentCollectStep.proposalFormId : null,
  };
};

export default connect(mapStateToProps, {
  close: closeCreateFusionModal,
  open: openCreateFusionModal,
  submit: submitFusionForm,
})(ProposalCreateFusionButton);
