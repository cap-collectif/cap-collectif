// @flow
import React from 'react';

import * as Icons from '../components/Icons';
import FormatButton from './FormatButton';

type Props = {
  editorState: Object,
  onAlignmentClick: Function,
  isBlockActive: Function,
};

function AlignmentPanel({ editorState, onAlignmentClick, isBlockActive }: Props) {
  return (
    <>
      <FormatButton
        onClick={() => onAlignmentClick('left')}
        active={isBlockActive(editorState, 'text-align-left')}
        tabIndex="-1"
        aria-label="Aligner à gauche"
        title="Aligner à gauche (⌘+Maj+L)">
        <Icons.AlignLeft />
      </FormatButton>
      <FormatButton
        onClick={() => onAlignmentClick('center')}
        active={isBlockActive(editorState, 'text-align-center')}
        tabIndex="-1"
        aria-label="Aligner au centre"
        title="Aligner au centre (⌘+Maj+E)">
        <Icons.AlignCenter />
      </FormatButton>
      <FormatButton
        onClick={() => onAlignmentClick('right')}
        active={isBlockActive(editorState, 'text-align-right')}
        tabIndex="-1"
        aria-label="Aligner à droite"
        title="Aligner à droite (⌘+Maj+R)">
        <Icons.AlignRight />
      </FormatButton>
    </>
  );
}

export default AlignmentPanel;
