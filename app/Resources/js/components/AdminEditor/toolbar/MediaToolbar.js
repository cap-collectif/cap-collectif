// @flow
import React, { useEffect, useContext, useRef, useState, type Node } from 'react';
import styled, { css } from 'styled-components';
import { EditorState, Modifier, SelectionState } from 'draft-js';
import { injectIntl, type IntlShape } from 'react-intl';

import FormatButton from './FormatButton';
import * as Icons from '../components/Icons';
import EditorContext from '../context';

const MediaWrapper = styled.div`
  position: relative;
  text-align: ${({ alignment }) => alignment};
`;

const Popover = styled.div`
  position: absolute;
  left: 50%;
  top: -10px;
  display: flex;
  flex-direction: row;
  padding: 5px 10px;
  box-shadow: 1px 3px 4px rgba(0, 0, 0, 0.3);
  background-color: rgba(255, 255, 255, 1);
  transition: opacity 0.15s ease-in-out;
  transform: translate(-50%, -100%);
  opacity: 0;
  z-index: -1;
  pointer-events: none;

  ${({ open }) =>
    open &&
    css`
      opacity: 1;
      z-index: 1;
      pointer-events: auto;
    `}
`;

const focusStyle = css`
  border-radius: 3px;
  box-shadow: 0 0 0 4px hsla(206, 79%, 53%, 0.4);
`;

const Backdrop = styled.div`
  cursor: pointer;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  ${({ focused }) => focused && focusStyle}

  &:hover {
    ${focusStyle}
  }
`;

type Props = {
  block: Object,
  children: Node,
  intl: IntlShape,
};

function Media({ block, children, intl }: Props) {
  const blockData = block.getData().toJS();
  const node = useRef();
  const [visible, open] = useState(false);
  // $FlowFixMe: context can be null but nevermind...
  const { editorState, handleChange } = useContext(EditorContext);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Detect if click is inside container (do nothing)
      if (node && node.current && node.current.contains(event.target)) {
        return;
      }

      open(false);
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, open]);

  function handleClick(event: SyntheticMouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (editorState) {
      open(true);

      const newSelection = SelectionState.createEmpty(block.getKey());
      handleChange(EditorState.forceSelection(editorState, newSelection));
    }
  }

  function handleMediaAlignment(event: SyntheticMouseEvent<HTMLButtonElement>, alignment) {
    event.preventDefault();

    // Create a fake selection because of special block
    const selectionState = SelectionState.createEmpty(block.getKey());

    // Put data in block
    const newContentState = Modifier.mergeBlockData(
      editorState.getCurrentContent(),
      selectionState,
      { alignment },
    );

    const newState = EditorState.push(editorState, newContentState, 'change-block-data');
    handleChange(newState);
  }

  return (
    <MediaWrapper alignment={blockData && blockData.alignment}>
      <Popover ref={node} open={visible}>
        <FormatButton
          onClick={event => handleMediaAlignment(event, 'left')}
          tabIndex="-1"
          title={intl.formatMessage({ id: 'editor.align.left' })}
          shortcut="⌘+Maj+L">
          <Icons.AlignLeft />
        </FormatButton>
        <FormatButton
          onClick={event => handleMediaAlignment(event, 'center')}
          tabIndex="-1"
          title={intl.formatMessage({ id: 'editor.align.center' })}
          shortcut="⌘+Maj+E">
          <Icons.AlignCenter />
        </FormatButton>
        <FormatButton
          onClick={event => handleMediaAlignment(event, 'right')}
          tabIndex="-1"
          title={intl.formatMessage({ id: 'editor.align.right' })}
          shortcut="⌘+Maj+R">
          <Icons.AlignRight />
        </FormatButton>
      </Popover>
      {children}
      <Backdrop onClick={handleClick} focused={visible} />
    </MediaWrapper>
  );
}

export default injectIntl(Media);
