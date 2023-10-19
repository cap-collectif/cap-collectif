import * as React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { Modal, Button } from 'react-bootstrap'
import CloseButton from '~/components/Form/CloseButton'
import ModalLeavePageContainer from './LeavePageModal.style'

type Props = {
  isShow?: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  content: string
  btnConfirmMessage: string
  onCloseAndConfirm?: () => void
  btnCloseAndConfirmlMessage?: string
}
export const LeavePageModal = ({
  isShow = false,
  onClose,
  onConfirm,
  onCloseAndConfirm,
  content,
  title,
  btnConfirmMessage,
  btnCloseAndConfirmlMessage,
}: Props) => {
  const intl = useIntl()
  return (
    <ModalLeavePageContainer show={isShow} onHide={onClose} aria-labelledby="leave-page-modal">
      <Modal.Header
        closeButton
        closeLabel={intl.formatMessage({
          id: 'close.modal',
        })}
      >
        <Modal.Title className="font-weight-bold">
          <FormattedMessage id={title} />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormattedMessage id={content} />
      </Modal.Body>
      <Modal.Footer>
        <CloseButton onClose={onClose} />
        <Button onClick={onConfirm} bsStyle="danger">
          <FormattedMessage id={btnConfirmMessage} />
        </Button>
        {onCloseAndConfirm && btnCloseAndConfirmlMessage && (
          <Button onClick={onCloseAndConfirm} bsStyle="info">
            <FormattedMessage id={btnCloseAndConfirmlMessage} />
          </Button>
        )}
      </Modal.Footer>
    </ModalLeavePageContainer>
  )
}
export default LeavePageModal
