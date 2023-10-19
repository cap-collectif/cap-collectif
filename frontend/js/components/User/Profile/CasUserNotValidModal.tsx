import * as React from 'react'
import { Modal, Button } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'
import { baseUrl } from '~/config'

const onHideModal = () => {
  window.location.replace(`${baseUrl}/logout`)
}

const CasUserNotValidModal = () => {
  const intl = useIntl()
  return (
    <Modal animation={false} show onHide={onHideModal} bsSize="small" aria-labelledby="contained-modal-title-lg">
      <Modal.Header
        closeButton
        closeLabel={intl.formatMessage({
          id: 'close.modal',
        })}
      >
        <Modal.Title id="contained-modal-title-lg">
          <FormattedMessage id="cas-error-subject" tagName="strong" />
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormattedMessage id="cas-error-message" tagName="p" />
      </Modal.Body>
      <Modal.Footer>
        <Button bsStyle="primary" onClick={onHideModal}>
          <FormattedMessage id="global.close" />
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default CasUserNotValidModal
