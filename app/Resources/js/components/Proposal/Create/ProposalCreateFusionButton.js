import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import {
  closeCreateFusionModal,
  openCreateFusionModal,
  submitFusionForm,
} from '../../../redux/modules/proposal';
import ProposalFusionForm from '../Form/ProposalFusionForm';
import CloseButton from '../../Form/CloseButton';
import SubmitButton from '../../Form/SubmitButton';
import ProposalAdminForm from '../Form/ProposalAdminForm';
import Fetcher from '../../../services/Fetcher';
import { formValueSelector } from 'redux-form';

export const ProposalCreateFusionButton = React.createClass({
  propTypes: {
    showModal: PropTypes.bool.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    open: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired,
    submit: PropTypes.func.isRequired,
    proposalFormId: PropTypes.number,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      proposalForm: null,
    };
  },

  componentDidUpdate(prevProps) {
    if (prevProps.proposalFormId !== this.props.proposalFormId) {
      this.loadProposalForm();
    }
  },

  loadProposalForm() {
    const { proposalFormId } = this.props;
    if (proposalFormId) {
      Fetcher
      .get(`/proposal_forms/${proposalFormId}`)
      .then(proposalForm => this.setState({ proposalForm }));
    }
  },

  render() {
    const { showModal, isSubmitting, open, close, submit } = this.props;
    const { proposalForm } = this.state;
    return (
      <div>
        <Button
          id="add-proposal-fusion"
          bsStyle="primary"
          onClick={() => open()}
        >
          <i className="cap cap-add-1"></i>
          { ` ${this.getIntlMessage('proposal.add_fusion')}`}
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
            <h3>Propositions fusionnées</h3>
            <ProposalFusionForm />
            {
              proposalForm &&
                <div>
                  <h3>Nouvelle proposition issue de la fusion</h3>
                  <ProposalAdminForm proposalForm={proposalForm} />
                </div>
            }
          </Modal.Body>
          <Modal.Footer>
            <CloseButton onClose={() => close()} />
            <SubmitButton
              id="confirm-proposal-create"
              isSubmitting={isSubmitting}
              onSubmit={() => submit(proposalForm.id)}
            />
          </Modal.Footer>
        </Modal>
      </div>
    );
  },

});

const mapStateToProps = state => {
  const selectedProject = parseInt(formValueSelector('proposal')(state, 'project'), 10);
  const currentCollectStep = selectedProject ? state.project.projects.find(p => p.id === selectedProject).steps.filter(step => step.type === 'collect')[0] : null;
  return {
    showModal: state.proposal.isCreatingFusion,
    isSubmitting: state.proposal.isSubmittingFusion,
    proposalFormId: currentCollectStep ? currentCollectStep.proposalFormId : null,
  };
};

export default connect(
  mapStateToProps,
  { close: closeCreateFusionModal, open: openCreateFusionModal, submit: submitFusionForm }
)(ProposalCreateFusionButton);
