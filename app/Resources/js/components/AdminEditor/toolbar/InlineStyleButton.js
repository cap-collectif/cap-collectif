// @flow
import React, { type Node } from 'react';
import { RichUtils } from 'draft-js';

import FormatButton from './FormatButton';
import { type DraftInlineStyle } from '../models/types';

type Props = {
  editorState: Object,
  handleChange: Function,
  styleName: DraftInlineStyle,
  title: string,
  shortcut?: string,
  children: Node,
};

function InlineStyleButton({
  editorState,
  handleChange,
  styleName,
  title,
  shortcut = '',
  children,
  ...rest
}: Props) {
  function handleClick(event: SyntheticMouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    handleChange(RichUtils.toggleInlineStyle(editorState, styleName));
  }

  function isActive(): boolean {
    return editorState.getCurrentInlineStyle().has(styleName);
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

export default InlineStyleButton;
