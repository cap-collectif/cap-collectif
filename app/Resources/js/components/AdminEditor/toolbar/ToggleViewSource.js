// @flow
import React from 'react';
import { injectIntl, type IntlShape } from 'react-intl';

import * as Icons from '../components/Icons';
import FormatButton from './FormatButton';
import ConfirmDialog from './ConfirmDialog';
import { useDialog } from '../components/Dialog';

type Props = {
  toggleEditorMode: Function,
  disabled?: boolean,
  active?: boolean,
  intl: IntlShape,
};

function ToggleViewSource({ toggleEditorMode, disabled = false, active = false, intl }: Props) {
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
        message={intl.formatMessage({ id: 'editor.convert.confirmation' })}
        onConfirm={handleConfirm}
      />
      <FormatButton
        tabIndex="-1"
        aria-haspopup="dialog"
        title={intl.formatMessage({ id: 'editor.convert.html' })}
        onClick={handleClick}
        disabled={disabled}
        active={active}>
        <Icons.ViewSource />
      </FormatButton>
    </>
  );
}

export default injectIntl(ToggleViewSource);
