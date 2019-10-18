// @flow
import React from 'react';

import FormatButton from './FormatButton';

type Props = {
  editorState: Object,
  onTitleClick: Function,
  isBlockActive: Function,
};

function TitlesPanel({ editorState, onTitleClick, isBlockActive }: Props) {
  return (
    <>
      <FormatButton
        onClick={() => onTitleClick('one')}
        active={isBlockActive(editorState, 'header-one')}
        tabIndex="-1"
        aria-label="Titre 1"
        title="Titre 1">
        H1
      </FormatButton>
      <FormatButton
        onClick={() => onTitleClick('two')}
        active={isBlockActive(editorState, 'header-two')}
        tabIndex="-1"
        aria-label="Titre 2"
        title="Titre 2">
        H2
      </FormatButton>
      <FormatButton
        onClick={() => onTitleClick('three')}
        active={isBlockActive(editorState, 'header-three')}
        tabIndex="-1"
        aria-label="Titre 3"
        title="Titre 3">
        H3
      </FormatButton>
      <FormatButton
        onClick={() => onTitleClick('four')}
        active={isBlockActive(editorState, 'header-four')}
        tabIndex="-1"
        aria-label="Titre 4"
        title="Titre 4">
        H4
      </FormatButton>
      <FormatButton
        onClick={() => onTitleClick('five')}
        active={isBlockActive(editorState, 'header-five')}
        tabIndex="-1"
        aria-label="Titre 5"
        title="Titre 5">
        H5
      </FormatButton>
      <FormatButton
        onClick={() => onTitleClick('six')}
        active={isBlockActive(editorState, 'header-six')}
        tabIndex="-1"
        aria-label="Titre 6"
        title="Titre 6">
        H6
      </FormatButton>
    </>
  );
}

export default TitlesPanel;
