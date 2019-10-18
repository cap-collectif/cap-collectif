// @flow
import React, { type Node } from 'react';
import { RichUtils } from 'draft-js';

import FormatButton from './FormatButton';
import { type DraftBlockStyle } from '../models/types';

type Props = {
  editorState: Object,
  handleChange: Function,
  styleName: DraftBlockStyle,
  title: string,
  shortcut?: string,
  children: Node,
};

function BlockStyleButton({
  editorState,
  handleChange,
  styleName,
  title,
  shortcut = '',
  children,
  ...rest
}: Props) {
  function handleClick() {
    handleChange(RichUtils.toggleBlockType(editorState, styleName));
  }

  function isActive(): boolean {
    if (!editorState) return false;

    const startKey = editorState.getSelection().getStartKey();
    const selectedBlockType = editorState
      .getCurrentContent()
      .getBlockForKey(startKey)
      .getType();

    return selectedBlockType === styleName;
  }

  const label = `${title} ${shortcut && `(${shortcut})`}`;

  return (
    <FormatButton
      active={isActive()}
      onClick={handleClick}
      tabIndex="-1"
      title={label}
      aria-label={label}
      {...rest}>
      {children}
    </FormatButton>
  );
}

export default BlockStyleButton;
