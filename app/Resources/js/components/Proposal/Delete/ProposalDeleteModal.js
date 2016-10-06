import React, { PropTypes } from 'react';
import { IntlMixin, FormattedMessage } from 'react-intl';
import SubmitButton from '../../Form/SubmitButton';
import CloseButton from '../../Form/CloseButton';
import { Modal } from 'react-bootstrap';

const ProposalDeleteModal = React.createClass({
  propTypes: {
    form: PropTypes.object.isRequired,
    proposal: PropTypes.object.isRequired,
    show: PropTypes.bool.isRequired,
    onToggleModal: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      isSubmitting: false,
    };
  },

  handleSubmit() {
    const {
      form,
      proposal,
    } = this.props;
    this.setState({ isSubmitting: true });
    // ProposalActions
    //   .delete(form.id, proposal.id)
    //   .then(() => {
    //     window.location.href = proposal._links.index;
    //   })
    //   .catch(() => {
    //     this.setState({ isSubmitting: false });
    //   })
  },

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
      proposal,
      show,
    } = this.props;
    return (
      <div>
        <Modal
          animation={false}
          show={show}
          onHide={this.close}
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
            <CloseButton onClose={this.close} />
            <SubmitButton
              id="confirm-proposal-delete"
              isSubmitting={this.state.isSubmitting}
              onSubmit={this.handleSubmit}
              label="global.remove"
              bsStyle="danger"
            />
          </Modal.Footer>
        </Modal>
      </div>
    );
  },

});

export default ProposalDeleteModal;
