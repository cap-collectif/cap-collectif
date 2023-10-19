// @ts-nocheck
import type { ComponentType } from 'react'
import React, { useState } from 'react'
import type { IntlShape } from 'react-intl'
import { injectIntl } from 'react-intl'
import styled from 'styled-components'
import { Form, Label, SubLabel, Input } from '../components/Form'
import Button from '../components/Button'
import type { DialogState } from '../components/Dialog'
import Dialog, { DialogBackdrop } from '../components/Dialog'
import type { LinkEntityData } from '../models/types'
import '../models/types'

const ActionsWrapper: ComponentType<{}> = styled('div')`
  display: flex;
  margin-top: 32px;
`
type LinkPropertiesDialogProps = DialogState & {
  onConfirm: (data: LinkEntityData) => void
  initialData?: LinkEntityData
  intl: IntlShape
  mode?: 'insert' | 'edit'
}

function getSubmitButtonMessage(mode) {
  switch (mode) {
    case 'edit':
      return 'editor.link.edit.submit'

    case 'insert':
    default:
      return 'editor.link.insert.submit'
  }
}

function LinkPropertiesDialog({
  onConfirm,
  mode = 'insert',
  initialData = {
    href: '',
    targetBlank: false,
  },
  intl,
  ...dialog
}: LinkPropertiesDialogProps) {
  const [formState, setFormState] = useState<LinkEntityData>(initialData)

  function handleSubmit(event: React.SyntheticEvent<HTMLButtonElement>) {
    event.preventDefault()
    dialog.hide()
    onConfirm(formState)
  }

  function handleCancel(event: React.SyntheticEvent<HTMLButtonElement>) {
    event.preventDefault()
    dialog.hide()
    setFormState(initialData)
  }

  function handleChange(event: React.SyntheticEvent<HTMLInputElement>) {
    const { name } = event.currentTarget
    const value = event.currentTarget.type === 'checkbox' ? event.currentTarget.checked : event.currentTarget.value
    setFormState({ ...formState, [name]: value })
  }

  return (
    <>
      <DialogBackdrop {...dialog} />
      <Dialog {...dialog}>
        <Form onSubmit={handleSubmit}>
          <Label htmlFor="href">
            {intl.formatMessage({
              id: 'editor.link.href',
            })}
          </Label>
          <Input type="text" id="href" name="href" value={formState.href || ''} onChange={handleChange} fullWidth />
          <input
            type="checkbox"
            id="targetBlank"
            name="targetBlank"
            onChange={handleChange}
            checked={formState.targetBlank}
          />{' '}
          <SubLabel htmlFor="targetBlank">
            {intl.formatMessage({
              id: 'editor.link.target',
            })}
          </SubLabel>
          <ActionsWrapper>
            <Button type="button" onClick={handleSubmit} variant="primary">
              {intl.formatMessage({
                id: getSubmitButtonMessage(mode),
              })}
            </Button>
            <Button onClick={handleCancel}>
              {intl.formatMessage({
                id: 'global.cancel',
              })}
            </Button>
          </ActionsWrapper>
        </Form>
      </Dialog>
    </>
  )
}

export default injectIntl(LinkPropertiesDialog)
