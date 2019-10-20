// @flow
import React, { type Node } from 'react';
import { injectIntl, type IntlShape } from 'react-intl';
import styled from 'styled-components';

import Button from '../components/Button';
import Dialog, { DialogBackdrop, type DialogState } from '../components/Dialog';

const DialogWrapper = styled.div`
  display: flex;
  margin-top: 8px;
`;

type Props = {
  dialog: DialogState,
  message: Node,
  onConfirm: Function,
  intl: IntlShape,
};

function ConfirmDialog({ dialog, message, onConfirm, intl }: Props) {
  function handleConfirm(event: SyntheticEvent<HTMLButtonElement>) {
    event.preventDefault();
    dialog.hide();
    onConfirm();
  }

  function handleCancel(event: SyntheticEvent<HTMLButtonElement>) {
    event.preventDefault();
    dialog.hide();
  }

  return (
    <>
      <DialogBackdrop {...dialog} />
      <Dialog {...dialog}>
        {message}
        <DialogWrapper>
          <Button onClick={handleConfirm} variant="success">
            {intl.formatMessage({ id: 'global.confirm' })}
          </Button>
          <Button onClick={handleCancel}>{intl.formatMessage({ id: 'global.cancel' })}</Button>
        </DialogWrapper>
      </Dialog>
    </>
  );
}

export default injectIntl(ConfirmDialog);
