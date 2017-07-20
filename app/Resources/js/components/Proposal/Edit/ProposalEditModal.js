import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import SubmitButton from '../../Form/SubmitButton';
import CloseButton from '../../Form/CloseButton';
import ProposalForm from '../Form/ProposalForm';
import { editProposalForm, closeEditProposalModal } from '../../../redux/modules/proposal';

const ProposalEditModal = React.createClass({
  propTypes: {
    form: PropTypes.object.isRequired,
    categories: PropTypes.array.isRequired,
    proposal: PropTypes.object.isRequired,
    show: PropTypes.bool.isRequired,
    isSubmitting: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const {
      categories,
      form,
      proposal,
      show,
      isSubmitting,
      dispatch,
    } = this.props;
    return (
      <div>
        <Modal
          animation={false}
          show={show}
          onHide={() => {
            if (window.confirm(this.getIntlMessage('proposal.confirm_close_modal'))) { // eslint-disable-line no-alert
              dispatch(closeEditProposalModal());
            }
          }}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              { this.getIntlMessage('global.edit') }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ProposalForm
              form={form}
              categories={categories}
              isSubmitting={isSubmitting}
              mode="edit"
              proposal={proposal}
            />
          </Modal.Body>
          <Modal.Footer>
            <CloseButton
              onClose={() => { dispatch(closeEditProposalModal()); }}
            />
            <SubmitButton
              id="confirm-proposal-edit"
              isSubmitting={isSubmitting}
              onSubmit={() => { dispatch(editProposalForm()); }}
            />
          </Modal.Footer>
        </Modal>
      </div>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    show: state.proposal.showEditModal,
    isSubmitting: state.proposal.isEditing,
  };
};
export default connect(mapStateToProps)(ProposalEditModal);
