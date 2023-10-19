import React, { Component } from 'react'
import { Modal, Button } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { submit, Field } from 'redux-form'
import type { Dispatch } from '../../types'
import CloseButton from '../Form/CloseButton'
import renderComponent from '~/components/Form/Field'
import { accountForm as formName } from '~/redux/modules/user'

export const passwordForm = 'passwordForm'
type Props = {
  show: boolean
  dispatch: Dispatch
  handleClose: () => void
}
export class ConfirmPasswordModal extends Component<Props> {
  render() {
    const { show, handleClose, dispatch } = this.props
    return (
      <Modal
        animation={false}
        show={show}
        onHide={handleClose}
        bsSize="small"
        aria-labelledby="contained-modal-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">
            <FormattedMessage id="confirm_password.title" />
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FormattedMessage id="confirm_password.help" />
          <Field component={renderComponent} type="password" name="passwordConfirm" id="account__password" />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={handleClose} />
          <Button
            id="confirm-password-form-submit"
            onClick={() => {
              dispatch(submit(formName))
              handleClose()
            }}
            bsStyle="primary"
          >
            <FormattedMessage id="global.confirm" />
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }
}
export default connect<any, any>()(ConfirmPasswordModal)
