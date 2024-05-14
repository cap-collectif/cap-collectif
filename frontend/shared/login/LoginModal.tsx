import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { Button, CapUIModalSize, Modal } from '@cap-collectif/ui'

type Props = {
  submitting: boolean
  show: boolean
  onClose: () => void
  onSubmit: () => void
  byPassAuth: boolean
}

export const LoginModal = ({ show, byPassAuth }: Props) => {
  const intl = useIntl()

  if (!show) return null

  return (
    <Modal
      style={{
        zIndex: 9000,
      }}
      show={show}
      onClose={onClose}
      autoFocus
      size={CapUIModalSize.Sm}
      ariaLabel={intl.formatMessage({ id: 'global.login' })}
    >
      <Modal.Header>
        <Modal.Header id="contained-modal-title-lg">
          <FormattedMessage id="global.login" />
        </Modal.Header>
      </Modal.Header>
      <Modal.Body>ok</Modal.Body>
      <Modal.Footer>
        <Button></Button>
        {!byPassAuth && (
          <Button id="confirm-login" type="submit" disabled={submitting} bsStyle="primary">
            {submitting ? <FormattedMessage id="global.loading" /> : <FormattedMessage id="global.login_me" />}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  )
}

export default LoginModal
