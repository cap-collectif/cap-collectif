// @ts-nocheck
import type { ComponentType } from 'react'
import React, { useState } from 'react'
import type { IntlShape } from 'react-intl'
import { injectIntl } from 'react-intl'
import styled from 'styled-components'
import { Form, Label, Input } from '../components/Form'
import Button from '../components/Button'
import type { DialogState } from '../components/Dialog'
import Dialog, { DialogBackdrop } from '../components/Dialog'
import type { TableEntityData } from '../models/types'
import '../models/types'
import { normalizeNumberInput } from '~/components/Form/utils'

const ActionsWrapper: ComponentType<{}> = styled('div')`
  display: flex;
  margin-top: 32px;
`
type TablePropertiesDialogProps = DialogState & {
  onConfirm: (data: TableEntityData) => Promise<void> | void
  initialData?: TableEntityData
  intl: IntlShape
  mode?: 'insert' | 'edit'
}

function getSubmitButtonMessage(mode) {
  switch (mode) {
    case 'edit':
      return 'editor.table.edit.submit'

    case 'insert':
    default:
      return 'editor.table.insert.submit'
  }
}

function Table({
  onConfirm,
  mode = 'insert',
  initialData = {
    columns: 1,
    lines: 1,
  },
  intl,
  ...dialog
}: TablePropertiesDialogProps) {
  const [formState, setFormState] = useState<TableEntityData>(initialData)

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
    setFormState({ ...formState, [event.currentTarget.name]: event.currentTarget.value })
  }

  return (
    <>
      <DialogBackdrop {...dialog} />
      <Dialog {...dialog}>
        <Form onSubmit={handleSubmit}>
          <Label htmlFor="src">
            {intl.formatMessage({
              id: 'editor.lines',
            })}
          </Label>
          <Input
            type="number"
            normalize={normalizeNumberInput}
            min={1}
            id="lines"
            name="lines"
            value={formState.lines || 1}
            onChange={handleChange}
            disabled={mode === 'edit'}
          />
          <Label htmlFor="alt">
            {intl.formatMessage({
              id: 'editor.columns',
            })}
          </Label>
          <Input
            type="number"
            normalize={normalizeNumberInput}
            min={1}
            id="columns"
            name="columns"
            value={formState.columns || 1}
            onChange={handleChange}
          />
          <ActionsWrapper>
            {/** Button type is not submit in case the editor is inside a redux form, this sucks */}
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

export default injectIntl(Table)
