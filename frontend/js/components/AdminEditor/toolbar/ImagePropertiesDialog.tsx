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
import type { ImageEntityData } from '../models/types'
import '../models/types'
import FormatButton from './FormatButton'
import * as Icons from '../components/Icons'

const ActionsWrapper: ComponentType<{}> = styled('div')`
  display: flex;
  margin-top: 32px;
`
const DimensionsWrappeer: ComponentType<{}> = styled('div')`
  display: inline-flex;
  margin-top: 5px;
  align-items: center;
  button {
    margin-left: 10px;
  }
`
type ImagePropertiesDialogProps = DialogState & {
  onConfirm: (data: ImageEntityData) => Promise<void> | void
  initialData?: ImageEntityData
  intl: IntlShape
  mode?: 'insert' | 'edit'
}

function getSubmitButtonMessage(mode) {
  switch (mode) {
    case 'edit':
      return 'editor.image.edit.submit'

    case 'insert':
    default:
      return 'editor.image.insert.submit'
  }
}

function ImagePropertiesDialog({
  onConfirm,
  mode = 'insert',
  initialData = {
    src: '',
    alt: '',
  },
  intl,
  ...dialog
}: ImagePropertiesDialogProps) {
  const [formState, setFormState] = useState<ImageEntityData>(initialData)
  const [isLocked, setIsLocked] = useState(true)
  const [aspectRatio, setAspectRatio] = useState(parseInt(initialData.width, 10) / parseInt(initialData.height, 10))

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

  function handleWidthChange(event: React.SyntheticEvent<HTMLInputElement>) {
    const width = parseInt(event.currentTarget.value, 10)
    const height = isLocked ? Math.round(width / aspectRatio) : parseInt(formState.height, 10)

    if (!isLocked) {
      setAspectRatio(width / height)
    }

    setFormState({ ...formState, [event.currentTarget.name]: event.currentTarget.value, height })
  }

  function handleHeightChange(event: React.SyntheticEvent<HTMLInputElement>) {
    const height = parseInt(event.currentTarget.value, 10)
    const width = isLocked ? Math.round(height * aspectRatio) : parseInt(formState.width, 10)

    if (!isLocked) {
      setAspectRatio(width / height)
    }

    setFormState({ ...formState, [event.currentTarget.name]: event.currentTarget.value, width })
  }

  function handleChange(event: React.SyntheticEvent<HTMLInputElement>) {
    if (event.currentTarget.type !== 'checkbox') event.preventDefault()
    if (event.currentTarget.name === 'width') handleWidthChange(event)
    else if (event.currentTarget.name === 'height') handleHeightChange(event)
    else {
      setFormState({
        ...formState,
        [event.currentTarget.name]:
          event.currentTarget.type === 'checkbox' ? event.currentTarget.checked : event.currentTarget.value,
      })
    }
  }

  return (
    <>
      <DialogBackdrop {...dialog} />
      <Dialog {...dialog}>
        <Form onSubmit={handleSubmit}>
          <Label htmlFor="src">
            {intl.formatMessage({
              id: 'editor.image.url',
            })}
          </Label>
          <Input
            type="text"
            id="src"
            name="src"
            value={formState.src || ''}
            onChange={handleChange}
            disabled={mode === 'edit'}
            fullWidth
          />
          <Label htmlFor="alt">
            {intl.formatMessage({
              id: 'editor.image.alt',
            })}
          </Label>
          <Input type="text" id="alt" name="alt" value={formState.alt || ''} fullWidth onChange={handleChange} />
          {mode === 'edit' && (
            <>
              <Label as="span">
                {intl.formatMessage({
                  id: 'editor.media.size',
                })}
              </Label>{' '}
              <DimensionsWrappeer>
                <SubLabel htmlFor="width">
                  {intl.formatMessage({
                    id: 'editor.media.size.width',
                  })}
                </SubLabel>
                <Input
                  type="number"
                  id="width"
                  name="width"
                  value={formState.width || ''}
                  min={1}
                  onChange={handleChange}
                />
                <SubLabel htmlFor="height">
                  {intl.formatMessage({
                    id: 'editor.media.size.height',
                  })}
                </SubLabel>
                <Input
                  type="number"
                  id="height"
                  name="height"
                  value={formState.height || ''}
                  min={1}
                  onChange={handleChange}
                />
                <FormatButton
                  onClick={() => {
                    setIsLocked(!isLocked)
                  }}
                  tabIndex="-1"
                  title={intl.formatMessage({
                    id: 'editor.link.edit',
                  })}
                >
                  {isLocked ? <Icons.Lock /> : <Icons.LockOpen />}
                </FormatButton>
              </DimensionsWrappeer>
              <Label htmlFor="border">
                {intl.formatMessage({
                  id: 'editor.media.border',
                })}
              </Label>
              <Input
                type="number"
                id="border"
                name="border"
                value={formState.border || ''}
                min={0}
                onChange={handleChange}
              />
              <Label as="span">
                {intl.formatMessage({
                  id: 'editor.media.margin',
                })}
              </Label>
              <SubLabel htmlFor="marginX">
                {intl.formatMessage({
                  id: 'editor.media.margin.x',
                })}
              </SubLabel>
              <Input
                type="number"
                id="marginX"
                name="marginX"
                value={formState.marginX || ''}
                min={0}
                onChange={handleChange}
              />
              <SubLabel htmlFor="marginY">
                {intl.formatMessage({
                  id: 'editor.media.margin.y',
                })}
              </SubLabel>
              <Input
                type="number"
                id="marginY"
                name="marginY"
                value={formState.marginY || ''}
                min={0}
                onChange={handleChange}
              />
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
            </>
          )}
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

export default injectIntl(ImagePropertiesDialog)
