// @flow
import React, { useState, type ComponentType } from 'react';
import { injectIntl, type IntlShape } from 'react-intl';
import styled from 'styled-components';

import { Form, Label, SubLabel, Input } from '../components/Form';
import Button from '../components/Button';
import Dialog, { DialogBackdrop, type DialogState } from '../components/Dialog';
import { type IframeEntityData } from '../models/types';

const ActionsWrapper: ComponentType<{}> = styled('div')`
  display: flex;
  margin-top: 32px;
`;

type IframePropertiesDialogProps = DialogState & {
  onConfirm: (data: IframeEntityData) => void,
  initialData?: IframeEntityData,
  intl: IntlShape,
  mode?: 'insert' | 'edit',
};

function getSubmitButtonMessage(mode) {
  switch (mode) {
    case 'edit':
      return 'editor.iframe.edit.submit';
    case 'insert':
    default:
      return 'editor.iframe.insert.submit';
  }
}

function ImagePropertiesDialog({
  onConfirm,
  mode = 'insert',
  initialData = { src: '', title: '', width: '560', height: '315' },
  intl,
  ...dialog
}: IframePropertiesDialogProps) {
  const [formState, setFormState] = useState<IframeEntityData>(initialData);

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
          <Label htmlFor="src">{intl.formatMessage({ id: 'editor.iframe.url' })}</Label>
          <Input
            type="text"
            id="src"
            name="src"
            value={formState.src || ''}
            onChange={handleChange}
            disabled={mode === 'edit'}
            fullWidth
          />
          <Label htmlFor="title">{intl.formatMessage({ id: 'editor.iframe.title' })}</Label>
          <Input
            type="text"
            id="title"
            name="title"
            value={formState.title || ''}
            fullWidth
            onChange={handleChange}
          />
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
            required
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
            required
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
          <ActionsWrapper>
            {/** Button type is not submit in case the editor is inside a redux form, this sucks */}
            <Button type="button" onClick={handleSubmit} variant="primary">
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
