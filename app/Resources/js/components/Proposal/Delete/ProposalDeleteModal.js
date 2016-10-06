import React, { PropTypes } from 'react';
import { IntlMixin, FormattedMessage } from 'react-intl';
import SubmitButton from '../../Form/SubmitButton';
import CloseButton from '../../Form/CloseButton';
import { Modal } from 'react-bootstrap';
import { deleteProposal, closeDeleteProposalModal } from '../../../redux/modules/proposal';
import { connect } from 'react-redux';

const ProposalDeleteModal = React.createClass({
  propTypes: {
    form: PropTypes.object.isRequired,
    proposal: PropTypes.object.isRequired,
    show: PropTypes.bool.isRequired,
    isDeleting: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const {
      proposal,
      form,
      show,
      isDeleting,
      dispatch,
    } = this.props;
    return (
      <div>
        <Modal
          animation={false}
          show={show}
          onHide={() => { dispatch(closeDeleteProposalModal()); }}
          bsSize="large"
          aria-labelledby="contained-modal-title-lg"
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-lg">
              { this.getIntlMessage('global.remove') }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              <FormattedMessage
                message={this.getIntlMessage('proposal.delete.confirm')}
                title={proposal.title}
              />
            </p>
          </Modal.Body>
          <Modal.Footer>
            <CloseButton
              onClose={() => { dispatch(closeDeleteProposalModal()); }}
            />
            <SubmitButton
              id="confirm-proposal-delete"
              isSubmitting={isDeleting}
              onSubmit={() => { deleteProposal(form.id, proposal, dispatch); }}
              label="global.remove"
              bsStyle="danger"
            />
          </Modal.Footer>
        </Modal>
      </div>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    isDeleting: state.proposal.isDeleting,
    show: state.proposal.showDeleteModal,
  };
};
export default connect(mapStateToProps)(ProposalDeleteModal);
