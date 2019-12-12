// @flow
import React from 'react';
import { injectIntl, type IntlShape } from 'react-intl';

import * as Icons from '../components/Icons';
import FormatButton from './FormatButton';

type Props = {
  editorState: Object,
  onAlignmentClick: Function,
  isBlockActive: Function,
  intl: IntlShape,
};

function AlignmentPanel({ editorState, intl, onAlignmentClick, isBlockActive }: Props) {
  return (
    <>
      <FormatButton
        onClick={() => onAlignmentClick('left')}
        active={isBlockActive(editorState, 'text-align-left')}
        tabIndex="-1"
        title={intl.formatMessage({ id: 'editor.align.left' })}
        shortcut="⌘+Maj+L">
        <Icons.AlignLeft />
      </FormatButton>
      <FormatButton
        onClick={() => onAlignmentClick('center')}
        active={isBlockActive(editorState, 'text-align-center')}
        tabIndex="-1"
        title={intl.formatMessage({ id: 'editor.align.center' })}
        shortcut="⌘+Maj+E">
        <Icons.AlignCenter />
      </FormatButton>
      <FormatButton
        onClick={() => onAlignmentClick('right')}
        active={isBlockActive(editorState, 'text-align-right')}
        tabIndex="-1"
        title={intl.formatMessage({ id: 'editor.align.right' })}
        shortcut="⌘+Maj+R">
        <Icons.AlignRight />
      </FormatButton>
    </>
  );
}

export default injectIntl(AlignmentPanel);
