import React, { Component } from 'react'
import { Modal, Button } from 'react-bootstrap'
import { FormattedMessage, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { submit, Field } from 'redux-form'
import type { Dispatch } from '../../types'
import CloseButton from '../Form/CloseButton'
import renderComponent from '~/components/Form/Field'
import { accountForm as formName } from '~/redux/modules/user'
import { pxToRem } from '@shared/utils/pxToRem'
import type { IntlShape } from 'react-intl'

export const passwordForm = 'passwordForm'
type Props = {
  show: boolean
  dispatch: Dispatch
  handleClose: () => void
  onConfirm?: () => void
  isFranceConnectAccount?: boolean
  hasPassword?: boolean
  intl: IntlShape
}

export class ConfirmPasswordModal extends Component<Props> {
  render() {
    const { show, handleClose, dispatch, onConfirm, isFranceConnectAccount, hasPassword, intl } = this.props
    const needsPasswordCreation = isFranceConnectAccount && !hasPassword

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
            {needsPasswordCreation ? (
              <FormattedMessage id="registration.password" />
            ) : (
              <FormattedMessage id="confirm_password.title" />
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ display: 'flex', flexDirection: 'column', gap: pxToRem(16), marginBottom: pxToRem(8) }}>
            {needsPasswordCreation ? (
              <FormattedMessage id="franceconnect.local-password-only-warning" />
            ) : (
              <>
                <FormattedMessage id="confirm_password.help" />
                {isFranceConnectAccount && <FormattedMessage id="franceconnect.local-password-only-warning" />}
              </>
            )}
          </div>
          <Field
            component={renderComponent}
            type="password"
            name="passwordConfirm"
            id="account__password"
            label={needsPasswordCreation ? intl.formatMessage({ id: 'registration.password' }) : undefined}
          />
        </Modal.Body>
        <Modal.Footer>
          <CloseButton onClose={handleClose} />
          <Button
            id="confirm-password-form-submit"
            type="button"
            onClick={() => {
              if (onConfirm) {
                onConfirm()
              } else {
                dispatch(submit(formName))
              }
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

export default connect()(injectIntl(ConfirmPasswordModal))
