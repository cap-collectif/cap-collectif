import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import ProposalCreateButton from './ProposalCreateButton';
import SubmitButton from '../../Form/SubmitButton';
import CloseButton from '../../Form/CloseButton';
import ProposalForm from '../Form/ProposalForm';
import { Modal } from 'react-bootstrap';
import { submitProposalForm, openCreateModal, closeCreateModal } from '../../../redux/modules/proposal';

const ProposalCreate = React.createClass({
  propTypes: {
    form: PropTypes.object.isRequired,
    categories: PropTypes.array.isRequired,
    showModal: PropTypes.bool.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const {
      categories,
      form,
      showModal,
      isSubmitting,
    } = this.props;
    return (
      <div>
        <ProposalCreateButton
          disabled={!form.isContribuable}
          handleClick={() => this.props.dispatch(openCreateModal())}
        />
        <Modal
          animation={false}
          show={showModal}
          onHide={() => this.props.dispatch(closeCreateModal())}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              { this.getIntlMessage('proposal.add') }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ProposalForm
              form={form}
              isSubmitting={isSubmitting}
              categories={categories}
            />
          </Modal.Body>
          <Modal.Footer>
            <CloseButton
              onClose={() => this.props.dispatch(closeCreateModal())}
            />
            <SubmitButton
              id="confirm-proposal-create"
              isSubmitting={isSubmitting}
              onSubmit={() => this.props.dispatch(submitProposalForm())}
            />
          </Modal.Footer>
        </Modal>
      </div>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    isSubmitting: state.proposal.isCreating,
    showModal: state.proposal.showCreateModal,
  };
};

export default connect(mapStateToProps)(ProposalCreate);
