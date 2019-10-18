// @flow
import React from 'react';

import * as Icons from '../components/Icons';
import FormatButton from './FormatButton';
import ConfirmDialog from './ConfirmDialog';
import { useDialog } from '../components/Dialog';

type Props = {
  toggleEditorMode: Function,
  disabled?: boolean,
  active?: boolean,
};

function ToggleViewSource({ toggleEditorMode, disabled = false, active = false }: Props) {
  const dialog = useDialog();

  function handleConfirm() {
    toggleEditorMode();
  }

  function handleClick(event: SyntheticMouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    if (!active) {
      dialog.show();
    } else {
      handleConfirm();
    }
  }

  return (
    <>
      <ConfirmDialog
        dialog={dialog}
        message="Êtes-vous sûr de vouloir convertir l'éditeur WYSIWYG en éditeur HTML ? Cette action sera irréversible par la suite à moins de supprimer tout le contenu enregistré."
        onConfirm={handleConfirm}
      />
      <FormatButton
        tabIndex="-1"
        aria-label="Convertir en HTML"
        aria-haspopup="dialog"
        title="Convertir en HTML"
        onClick={handleClick}
        disabled={disabled}
        active={active}>
        <Icons.ViewSource />
      </FormatButton>
    </>
  );
}

export default ToggleViewSource;
