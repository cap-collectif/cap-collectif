// @flow
import React, { type Node } from 'react';

import Button from '../components/Button';
import Dialog, { DialogBackdrop, type DialogState } from '../components/Dialog';

type Props = {
  dialog: DialogState,
  message: Node,
  onConfirm: Function,
};

function ConfirmDialog({ dialog, message, onConfirm }: Props) {
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
        <div style={{ display: 'flex', marginTop: 8 }}>
          <Button onClick={handleConfirm} variant="success">
            Confirmer
          </Button>
          <Button onClick={handleCancel}>Annuler</Button>
        </div>
      </Dialog>
    </>
  );
}

export default ConfirmDialog;
