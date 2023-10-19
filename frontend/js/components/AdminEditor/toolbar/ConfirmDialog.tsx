// @ts-nocheck
import type { Node, ComponentType } from 'react'
import React from 'react'
import type { IntlShape } from 'react-intl'
import { injectIntl } from 'react-intl'
import styled from 'styled-components'
import Button from '../components/Button'
import type { DialogState } from '../components/Dialog'
import Dialog, { DialogBackdrop } from '../components/Dialog'

const ActionsWrapper: ComponentType<{}> = styled('div')`
  display: flex;
  margin-top: 8px;
`
type ConfirmDialogProps = {
  dialog: DialogState
  message: Node
  onConfirm: (...args: Array<any>) => any
  intl: IntlShape
}

function ConfirmDialog({ dialog, message, onConfirm, intl }: ConfirmDialogProps) {
  function handleConfirm(event: React.SyntheticEvent<HTMLButtonElement>) {
    event.preventDefault()
    dialog.hide()
    onConfirm()
  }

  function handleCancel(event: React.SyntheticEvent<HTMLButtonElement>) {
    event.preventDefault()
    dialog.hide()
  }

  return (
    <>
      <DialogBackdrop {...dialog} />
      <Dialog {...dialog} role="alertdialog">
        {message}
        <ActionsWrapper>
          <Button onClick={handleConfirm} variant="success">
            {intl.formatMessage({
              id: 'global.confirm',
            })}
          </Button>
          <Button onClick={handleCancel}>
            {intl.formatMessage({
              id: 'global.cancel',
            })}
          </Button>
        </ActionsWrapper>
      </Dialog>
    </>
  )
}

export default injectIntl(ConfirmDialog)
