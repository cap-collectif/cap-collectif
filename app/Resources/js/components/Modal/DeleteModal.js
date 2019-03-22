// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Modal, Button } from 'react-bootstrap';
import CloseButton from '../Form/CloseButton';

type Props = {
  showDeleteModal: boolean,
  closeDeleteModal: Function,
  deleteElement: Function,
  deleteModalTitle: string,
  deleteModalContent: string,
  buttonConfirmMessage?: string,
};

export class DeleteModal extends React.Component<Props> {
  render() {
    const {
      showDeleteModal,
      closeDeleteModal,
      deleteElement,
      deleteModalContent,
      deleteModalTitle,
      buttonConfirmMessage,
    } = this.props;

    const onDelete = () => {
      deleteElement();
      closeDeleteModal();
    };

    return (
      <Modal
        show={showDeleteModal}
        onHide={closeDeleteModal}
        aria-labelledby="delete-modal-title-lg">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            {<FormattedMessage id={deleteModalTitle} />}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <i className="cap cap-alert-2" style={{ color: '#dc3545', fontSize: '22px' }} />
          <FormattedMessage id={deleteModalContent} />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={closeDeleteModal} />
          <Button onClick={onDelete} bsStyle="danger">
            {buttonConfirmMessage ? (
              <FormattedMessage id={buttonConfirmMessage} />
            ) : (
              <FormattedMessage id="global.delete" />
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default connect()(DeleteModal);
