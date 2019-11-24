// @flow
import React, { useState, type ComponentType } from 'react';
import { injectIntl, type IntlShape } from 'react-intl';
import styled from 'styled-components';

import { Form, Label, SubLabel, Input } from '../components/Form';
import Button from '../components/Button';
import Dialog, { DialogBackdrop, type DialogState } from '../components/Dialog';
import { type ImageEntityData } from '../models/types';

const ActionsWrapper: ComponentType<{}> = styled('div')`
  display: flex;
  margin-top: 32px;
`;

type ImagePropertiesDialogProps = DialogState & {
  onConfirm: (data: ImageEntityData) => void,
  initialData?: ImageEntityData,
  intl: IntlShape,
  mode?: 'insert' | 'edit',
};

function getSubmitButtonMessage(mode) {
  switch (mode) {
    case 'edit':
      return 'editor.image.edit.submit';
    case 'insert':
    default:
      return 'editor.image.insert.submit';
  }
}

function ImagePropertiesDialog({
  onConfirm,
  mode = 'insert',
  initialData = { src: '', alt: '' },
  intl,
  ...dialog
}: ImagePropertiesDialogProps) {
  const [formState, setFormState] = useState<ImageEntityData>(initialData);

  function handleSubmit(event: SyntheticEvent<HTMLButtonElement>) {
    event.preventDefault();
    dialog.hide();
    onConfirm(formState);
  }

  function handleCancel(event: SyntheticEvent<HTMLButtonElement>) {
    event.preventDefault();
    dialog.hide();
    setFormState(initialData);
  }

  function handleChange(event: SyntheticEvent<HTMLInputElement>) {
    event.preventDefault();
    setFormState({
      ...formState,
      [event.currentTarget.name]: event.currentTarget.value,
    });
  }

  return (
    <>
      <DialogBackdrop {...dialog} />
      <Dialog {...dialog}>
        <Form onSubmit={handleSubmit}>
          <Label htmlFor="src">{intl.formatMessage({ id: 'editor.image.url' })}</Label>
          <Input
            type="text"
            id="src"
            name="src"
            value={formState.src || ''}
            onChange={handleChange}
            disabled={mode === 'edit'}
            fullWidth
            required
          />
          <Label htmlFor="alt">{intl.formatMessage({ id: 'editor.image.alt' })}</Label>
          <Input
            type="text"
            id="alt"
            name="alt"
            value={formState.alt || ''}
            fullWidth
            onChange={handleChange}
          />
          {mode === 'edit' && (
            <>
              <Label as="span">{intl.formatMessage({ id: 'editor.media.size' })}</Label>
              <SubLabel htmlFor="width">
                {intl.formatMessage({ id: 'editor.media.size.width' })}
              </SubLabel>
              <Input
                type="number"
                id="width"
                name="width"
                value={formState.width || ''}
                min={0}
                onChange={handleChange}
              />
              <SubLabel htmlFor="height">
                {intl.formatMessage({ id: 'editor.media.size.height' })}
              </SubLabel>
              <Input
                type="number"
                id="height"
                name="height"
                value={formState.height || ''}
                min={0}
                onChange={handleChange}
              />
              <Label htmlFor="border">{intl.formatMessage({ id: 'editor.media.border' })}</Label>
              <Input
                type="number"
                id="border"
                name="border"
                value={formState.border || ''}
                min={0}
                onChange={handleChange}
              />
              <Label as="span">{intl.formatMessage({ id: 'editor.media.margin' })}</Label>
              <SubLabel htmlFor="marginX">
                {intl.formatMessage({ id: 'editor.media.margin.x' })}
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
                {intl.formatMessage({ id: 'editor.media.margin.y' })}
              </SubLabel>
              <Input
                type="number"
                id="marginY"
                name="marginY"
                value={formState.marginY || ''}
                min={0}
                onChange={handleChange}
              />
            </>
          )}
          <ActionsWrapper>
            <Button type="submit" variant="primary">
              {intl.formatMessage({ id: getSubmitButtonMessage(mode) })}
            </Button>
            <Button onClick={handleCancel}>{intl.formatMessage({ id: 'global.cancel' })}</Button>
          </ActionsWrapper>
        </Form>
      </Dialog>
    </>
  );
}

export default injectIntl(ImagePropertiesDialog);
