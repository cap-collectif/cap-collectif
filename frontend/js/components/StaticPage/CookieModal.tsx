import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { useDisclosure } from '@liinkiing/react-hooks'
import { Button, Modal } from 'react-bootstrap'
import CloseButton from '../Form/CloseButton'
import CookieContent from './CookieContent'
type Props = {
  readonly separator?: string
}
export const CookieModal = ({ separator }: Props) => {
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const intl = useIntl()
  return (
    <div className="cookie-policy">
      <div>
        {separator && <span>{separator}</span>}
        <Button id="cookies-management" className="p-0" variant="link" bsStyle="link" onClick={onOpen} name="cookies">
          <FormattedMessage id="cookies" />
        </Button>
      </div>
      <Modal
        animation={false}
        show={isOpen}
        onHide={onClose}
        bsSize="large"
        id="cookies-modal"
        className="cookie-policy"
        aria-labelledby="contained-modal-title-lg"
      >
        <Modal.Header
          closeButton
          className="cookie-policy"
          closeLabel={intl.formatMessage({
            id: 'close.modal',
          })}
        >
          <Modal.Title id="contained-modal-title-lg" className="cookie-policy">
            <FormattedMessage id="cookies" />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CookieContent />
        </Modal.Body>
        <Modal.Footer className="cookie-policy">
          <CloseButton buttonId="cookies-cancel" onClose={onClose} />
        </Modal.Footer>
      </Modal>
    </div>
  )
}
export default CookieModal
