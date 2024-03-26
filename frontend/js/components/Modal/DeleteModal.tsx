import * as React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { connect } from 'react-redux'
import { Modal, Button } from 'react-bootstrap'
import CloseButton from '../Form/CloseButton'

type Props = {
  showDeleteModal: boolean
  closeDeleteModal: (...args: Array<any>) => any
  deleteElement: (...args: Array<any>) => any
  deleteModalTitle: string
  deleteModalContent: string
  buttonConfirmMessage?: string
  groupTitle?: string
}
export const DeleteModal = ({
  showDeleteModal,
  closeDeleteModal,
  deleteElement,
  deleteModalContent,
  deleteModalTitle,
  buttonConfirmMessage,
  groupTitle,
}: Props) => {
  const intl = useIntl()

  const onDelete = () => {
    deleteElement()
    closeDeleteModal()
  }

  return (
    <Modal show={showDeleteModal} onHide={closeDeleteModal} aria-labelledby="delete-modal-title-lg">
      <Modal.Header
        closeButton
        closeLabel={intl.formatMessage({
          id: 'close.modal',
        })}
      >
        <Modal.Title id="contained-modal-title-lg" className="font-weight-bold">
          <FormattedMessage id={deleteModalTitle} />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <i
          className="cap cap-alert-2"
          style={{
            color: '#dc3545',
            fontSize: '22px',
          }}
        />
        <FormattedMessage
          id={deleteModalContent}
          values={{
            grouptitle: <b>{groupTitle}</b>,
          }}
        />
      </Modal.Body>
      <Modal.Footer>
        <CloseButton onClose={closeDeleteModal} />
        <Button id="delete-modal-button-delete" onClick={onDelete} bsStyle="danger">
          {buttonConfirmMessage ? (
            <FormattedMessage id={buttonConfirmMessage} />
          ) : (
            <FormattedMessage id="global.delete" />
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
export default connect()(DeleteModal)
