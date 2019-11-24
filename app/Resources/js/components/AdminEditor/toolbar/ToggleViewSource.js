// @flow
import React from 'react';
import { injectIntl, type IntlShape } from 'react-intl';

import * as Icons from '../components/Icons';
import FormatButton from './FormatButton';
import ConfirmDialog from './ConfirmDialog';
import { useDialogState } from '../components/Dialog';

type Props = {
  toggleEditorMode: Function,
  disabled?: boolean,
  active?: boolean,
  intl: IntlShape,
};

function ToggleViewSource({ toggleEditorMode, disabled = false, active = false, intl }: Props) {
  const dialog = useDialogState();

  function handleConfirm() {
    toggleEditorMode();
  }

  function handleClick(event: SyntheticMouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    dialog.show();
  }

  return (
    <>
      <ConfirmDialog
        dialog={dialog}
        message={intl.formatMessage({
          id: active ? 'editor.convert.wysiwyg.confirmation' : 'editor.convert.html.confirmation',
        })}
        onConfirm={handleConfirm}
      />
      <FormatButton
        tabIndex="-1"
        aria-haspopup="dialog"
        title={intl.formatMessage({
          id: active ? 'editor.convert.wysiwyg' : 'editor.convert.html',
        })}
        onClick={handleClick}
        disabled={disabled}
        active={active}>
        <Icons.ViewSource />
      </FormatButton>
    </>
  );
}

export default injectIntl(ToggleViewSource);
