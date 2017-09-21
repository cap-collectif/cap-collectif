// @flow
import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import CloseButton from '../../Form/CloseButton';

export const RealisationStepDeleteModal = React.createClass({
  propTypes: {
    showModalDelete: PropTypes.bool.isRequired,
    closeModalDelete: PropTypes.func.isRequired,
    deleteProgressStep: PropTypes.func.isRequired,
  },

  render() {
    const { showModalDelete, closeModalDelete, deleteProgressStep } = this.props;

    const onDelete = () => {
      deleteProgressStep();
      closeModalDelete();
    };

    return (
      <Modal
        show={showModalDelete}
        onHide={closeModalDelete}
        bsSize="large"
        aria-labelledby="delete-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg" bsClass="modal-title">
            {<FormattedMessage id="proposal.admin.realisationStep.modal.delete" />}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {<FormattedMessage id="proposal.admin.realisationStep.modal.content" />}
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={closeModalDelete} />
          <Button onClick={onDelete} bsStyle="danger">
            {<FormattedMessage id="global.delete" />}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  },
});

export default connect()(RealisationStepDeleteModal);
